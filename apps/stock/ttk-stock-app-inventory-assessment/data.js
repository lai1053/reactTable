import moment from "moment"
export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "ttk-stock-app-inventory-assessment",
        children: [
            {
                name: "ttk-stock-app-spin",
                className: "ttk-stock-app-spin",
                component: "::div",
                _visible: "{{data.loading}}",
                children: "{{$stockLoading()}}",
            },
            {
                name: "main",
                component: "Tabs",
                className: "ttk-stock-app-inventory-assessment-main",
                animated: false,
                forceRender: false,
                activeKey: "{{data.other.activeTabKey}}",
                onChange: "{{$handleTabChange}}",
                children: [
                    {
                        name: "tab1",
                        component: "Tabs.TabPane",
                        _visible: "{{data.other.isShowFirstTab}}",
                        className: "ttk-stock-app-inventory-assessment-main-content",
                        key: "1",
                        children: "",
                        tab: "暂估入库",
                        forceRender: false,
                    },
                    {
                        name: "tab1",
                        component: "Tabs.TabPane",
                        _visible: "{{data.other.isShowFirstTab}}",
                        className: "ttk-stock-app-inventory-assessment-main-content",
                        tab: "暂估冲回",
                        forceRender: false,
                        key: "2",
                        children: "",
                    },
                ],
            },
            {
                name: "root-content",
                component: "Layout",
                _visible: "{{data.other.activeTabKey == 1}}",
                className: "ttk-stock-app-inventory-assessment-backgroundColor",
                children: [
                    {
                        name: "header",
                        component: "::div",
                        className: "ttk-stock-app-inventory-assessment-header",
                        children: [
                            {
                                name: "content",
                                component: "::div",
                                className: "ttk-stock-app-inventory-assessment-title",
                                children: [
                                    {
                                        name: "back",
                                        component: "::div",
                                        className: "back",
                                        onClick: "{{$back}}",
                                    },
                                    {
                                        name: "inv-app-batch-sale-header",
                                        component: "::div",
                                        className: "inv-app-batch-sale-header",
                                        children: [
                                            {
                                                name: "header-left",
                                                className: "header-left",
                                                component: "::div",
                                                children: [
                                                    {
                                                        name: "header-filter-input",
                                                        component: "Input",
                                                        className:
                                                            "inv-app-batch-sale-header-filter-input",
                                                        type: "text",
                                                        placeholder: "编号/存货名称",
                                                        value: "{{data.inputVal}}",
                                                        onChange:
                                                            "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
                                                        prefix: {
                                                            name: "search",
                                                            component: "Icon",
                                                            type: "search",
                                                        },
                                                    },
                                                    {
                                                        name: "popover",
                                                        component: "Popover",
                                                        popupClassName:
                                                            "inv-batch-sale-list-popover",
                                                        placement: "bottom",
                                                        title: "",
                                                        content: {
                                                            name: "popover-content",
                                                            component: "::div",
                                                            className:
                                                                "inv-batch-custom-popover-content",
                                                            children: [
                                                                {
                                                                    name: "filter-content",
                                                                    component: "::div",
                                                                    className: "filter-content",
                                                                    children: [
                                                                        {
                                                                            name: "bill-date",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "入库日期：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name:
                                                                                        "rangePicker",
                                                                                    component:
                                                                                        "DatePicker.RangePicker",
                                                                                    disabledDate:
                                                                                        "{{$disabledDate}}",
                                                                                    defaultPickerValue:
                                                                                        "{{[data.defaultPickerValue, data.defaultPickerValue]}}",

                                                                                    value:
                                                                                        "{{[$stringToMoment((data.form.strDate),'YYYY-MM-DD'), $stringToMoment((data.form.endDate),'YYYY-MM-DD')]}}",
                                                                                    onChange:
                                                                                        "{{function(v, arr){$sf('data.form.strDate', $momentToString(arr[0],'YYYY-MM-DD')); " +
                                                                                        "$sf('data.form.endDate', $momentToString(arr[1],'YYYY-MM-DD'))}}}",
                                                                                    allowClear: true,
                                                                                    placeholder:
                                                                                        "{{['开始日期', '结束日期']}}",
                                                                                    className:
                                                                                        "popover-body-content-item-date",
                                                                                    getCalendarContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            name: "popover-sale",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "往来单位：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name: "select",
                                                                                    component:
                                                                                        "Select",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-option",
                                                                                    showSearch: true,
                                                                                    getPopupContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                    placeholder:
                                                                                        "请选择",
                                                                                    filterOption:
                                                                                        "{{$filterIndustry}}",
                                                                                    value:
                                                                                        "{{data.form.constom}}",
                                                                                    onSelect:
                                                                                        "{{function(e){$sf('data.form.constom',e)}}}",
                                                                                    children:
                                                                                        "{{$getSelectOption()}}",
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            name: "popover-sale",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "凭证状态：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name: "select",
                                                                                    component:
                                                                                        "Select",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-option",
                                                                                    showSearch: true,
                                                                                    getPopupContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                    placeholder:
                                                                                        "请选择",
                                                                                    filterOption:
                                                                                        "{{$filterIndustry}}",
                                                                                    value:
                                                                                        "{{data.form.voucherName}}",
                                                                                    onSelect:
                                                                                        "{{function(e){$changeVoucherSelect(e)}}}",
                                                                                    children:
                                                                                        "{{$renderVoucherIdsSelectOption()}}",
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    name: "filter-footer",
                                                                    component: "::div",
                                                                    className: "filter-footer",
                                                                    children: [
                                                                        {
                                                                            name: "search",
                                                                            component: "Button",
                                                                            type: "primary",
                                                                            children: "查询",
                                                                            onClick:
                                                                                "{{$filterList}}",
                                                                        },
                                                                        {
                                                                            name: "reset",
                                                                            className: "reset-btn",
                                                                            component: "Button",
                                                                            children: "重置",
                                                                            onClick:
                                                                                "{{$resetForm}}",
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        trigger: "click",
                                                        visible: "{{data.showPopoverCard}}",
                                                        onVisibleChange:
                                                            "{{$handlePopoverVisibleChange}}",
                                                        children: {
                                                            name: "filterSpan",
                                                            component: "::span",
                                                            className:
                                                                "inv-batch-custom-filter-btn header-item",
                                                            children: {
                                                                name: "filter",
                                                                component: "Icon",
                                                                type: "filter",
                                                            },
                                                        },
                                                    },
                                                ],
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
                        className: "ttk-stock-app-inventory-assessment-content",
                        children: "{{$zgrkGrid()}}",
                    },
                ],
            },
            {
                name: "footer",
                _visible: "{{data.other.activeTabKey == 1}}",
                component: "::div",
                className: "ttk-stock-app-inventory-assessment-footer",
                style: { paddingRight: "20px", position: "relative" },
                children: [
                    {
                        component: "::div",
                        className: "zangu-sum",
                        children: "{{$renderSum()}}",
                    },
                    {
                        name: "pagination",
                        component: "Pagination",
                        showSizeChanger: true,
                        pageSize: "{{data.pagination.pageSize}}",
                        current: "{{data.pagination.current}}",
                        total: "{{data.pagination.total}}",
                        showTotal: "{{$pageShowTotal}}",
                        onChange: "{{$pageChanged}}",
                        onShowSizeChange: "{{$pageChanged}}",
                    },
                ],
            },
            {
                name: "root-content",
                component: "Layout",
                _visible: "{{data.other.activeTabKey == 2}}",
                className: "ttk-stock-app-inventory-assessment-backgroundColor",
                children: [
                    {
                        name: "header",
                        component: "::div",
                        style: { position: "relative", overflow: "hidden" },
                        className: "ttk-stock-app-inventory-assessment-header",
                        children: [
                            {
                                name: "content",
                                component: "::div",
                                className: "ttk-stock-app-inventory-assessment-title",
                                children: [
                                    {
                                        name: "back",
                                        component: "::div",
                                        className: "back",
                                        onClick: "{{$back}}",
                                    },
                                    {
                                        name: "inv-app-batch-sale-header",
                                        component: "::div",
                                        className: "inv-app-batch-sale-header",
                                        children: [
                                            {
                                                name: "header-left",
                                                className: "header-left",
                                                component: "::div",
                                                children: [
                                                    {
                                                        name: "header-filter-input",
                                                        component: "Input",
                                                        className:
                                                            "inv-app-batch-sale-header-filter-input",
                                                        type: "text",
                                                        placeholder: "编号/存货名称",
                                                        value: "{{data.input}}",
                                                        onChange:
                                                            "{{function (e) {$onSearch('data.input', e.target.value)}}}",
                                                        prefix: {
                                                            name: "search",
                                                            component: "Icon",
                                                            type: "search",
                                                        },
                                                    },
                                                    {
                                                        name: "popover",
                                                        component: "Popover",
                                                        popupClassName:
                                                            "inv-batch-sale-list-popover",
                                                        placement: "bottom",
                                                        title: "",
                                                        content: {
                                                            name: "popover-content",
                                                            component: "::div",
                                                            className:
                                                                "inv-batch-custom-popover-content",
                                                            children: [
                                                                {
                                                                    name: "filter-content",
                                                                    component: "::div",
                                                                    className: "filter-content",
                                                                    children: [
                                                                        {
                                                                            name: "bill-date",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "冲回日期：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name:
                                                                                        "rangePicker",
                                                                                    component:
                                                                                        "DatePicker.RangePicker",
                                                                                    disabledDate:
                                                                                        "{{$disabledDate}}",
                                                                                    defaultPickerValue:
                                                                                        "{{[data.defaultPickerValue, data.defaultPickerValue]}}",

                                                                                    value:
                                                                                        "{{[$stringToMoment((data.form.startTime),'YYYY-MM-DD'), $stringToMoment((data.form.endTime),'YYYY-MM-DD')]}}",
                                                                                    onChange:
                                                                                        "{{function(v, arr){$sf('data.form.startTime', $momentToString(arr[0],'YYYY-MM-DD')); " +
                                                                                        "$sf('data.form.endTime', $momentToString(arr[1],'YYYY-MM-DD'))}}}",
                                                                                    allowClear: true,
                                                                                    placeholder:
                                                                                        "{{['开始日期', '结束日期']}}",
                                                                                    className:
                                                                                        "popover-body-content-item-date",
                                                                                    getCalendarContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                    //value: "{{$stringToMoment((data.formContent.strDate),'YYYY-MM-DD')}}"
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            name: "popover-sale",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "往来单位：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name: "select",
                                                                                    component:
                                                                                        "Select",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-option",
                                                                                    showSearch: true,
                                                                                    getPopupContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                    placeholder:
                                                                                        "请选择",
                                                                                    filterOption:
                                                                                        "{{$filterIndustry}}",
                                                                                    value:
                                                                                        "{{data.form.supplier}}",
                                                                                    onSelect:
                                                                                        "{{function(e){$sf('data.form.supplier',e)}}}",
                                                                                    children:
                                                                                        "{{$getSelectOption()}}",
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            name: "popover-sale",
                                                                            component: "::div",
                                                                            className:
                                                                                "inv-batch-custom-popover-item",
                                                                            children: [
                                                                                {
                                                                                    name: "label",
                                                                                    component:
                                                                                        "::span",
                                                                                    children:
                                                                                        "凭证状态：",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-label",
                                                                                },
                                                                                {
                                                                                    name: "select",
                                                                                    component:
                                                                                        "Select",
                                                                                    className:
                                                                                        "inv-batch-custom-popover-option",
                                                                                    showSearch: true,
                                                                                    getPopupContainer:
                                                                                        "{{function(trigger) {return trigger.parentNode}}}",
                                                                                    placeholder:
                                                                                        "请选择",
                                                                                    filterOption:
                                                                                        "{{$filterIndustry}}",
                                                                                    value:
                                                                                        "{{data.form.voucherName2}}",
                                                                                    onSelect:
                                                                                        "{{function(e){$changeVoucherSelect2(e)}}}",
                                                                                    children:
                                                                                        "{{$renderVoucherIdsSelectOption2()}}",
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    name: "filter-footer",
                                                                    component: "::div",
                                                                    className: "filter-footer",
                                                                    children: [
                                                                        {
                                                                            name: "search",
                                                                            component: "Button",
                                                                            type: "primary",
                                                                            children: "查询",
                                                                            onClick:
                                                                                "{{$filterList}}",
                                                                        },
                                                                        {
                                                                            name: "reset",
                                                                            className: "reset-btn",
                                                                            component: "Button",
                                                                            children: "重置",
                                                                            onClick:
                                                                                "{{$resetFormCH}}",
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        trigger: "click",
                                                        visible: "{{data.showPopoverCard}}",
                                                        onVisibleChange:
                                                            "{{$handlePopoverVisibleChange}}",
                                                        children: {
                                                            name: "filterSpan",
                                                            component: "::span",
                                                            className:
                                                                "inv-batch-custom-filter-btn header-item",
                                                            children: {
                                                                name: "filter",
                                                                component: "Icon",
                                                                type: "filter",
                                                            },
                                                        },
                                                    },
                                                ],
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
                        className: "ttk-stock-app-inventory-assessment-content",
                        children: "{{$zgchGrid()}}",
                    },
                ],
            },
            {
                name: "footer",
                _visible: "{{data.other.activeTabKey == 2}}",
                component: "::div",
                className: "ttk-stock-app-inventory-assessment-footer",
                style: { paddingRight: "20px", position: "relative" },
                children: [
                    {
                        component: "::div",
                        className: "zangu-sum",
                        children: "{{$renderSum()}}",
                    },
                    {
                        name: "pagination",
                        component: "Pagination",
                        showSizeChanger: true,
                        pageSize: "{{data.paginationList.pageSize}}",
                        current: "{{data.paginationList.current}}",
                        total: "{{data.paginationList.total}}",
                        onChange: "{{$pageListChanged}}",
                        showTotal: "{{$pageShowListTotal}}",
                        onShowSizeChange: "{{$pageListChanged}}",
                    },
                ],
            },
            {
                name: "reinit",
                component: "::div",
                className: "reinit",
                children: [
                    {
                        name: "query1",
                        component: "Button",
                        type: "primary",
                        className: "myhelloworld-button",
                        disabled: "{{data.limit.stateNow}}",
                        _visible: "{{data.other.activeTabKey == 1 && !data.xdzOrgIsStop}}", // 已停用的账户不显示
                        onClick: "{{$addType}}",
                        children: "新增",
                    },
                    {
                        _visible: "{{!data.xdzOrgIsStop}}", // 已停用的账户不显示
                        name: "query",
                        component: "Button.Group",
                        type: "primary",
                        className: "voucher-button-group",
                        children: [
                            {
                                name: "voucher",
                                component: "Button",
                                type: "primary",
                                onClick: "{{$generateVoucher}}",
                                children: "生成凭证",
                            },
                            {
                                name: "batch3",
                                component: "Dropdown",
                                trigger: '{{["click"]}}',
                                children: {
                                    name: "voucher-icon",
                                    component: "Button",
                                    type: "primary",
                                    icon: "setting",
                                },
                                overlay: {
                                    name: "menu",
                                    component: "Menu",
                                    onClick: "{{$moreActionClick}}",
                                    children: [
                                        {
                                            name: "settlement",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "mergeVouchers",
                                            children: "凭证合并",
                                        },
                                        {
                                            name: "settlement",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "subjectSetting",
                                            children: "科目设置",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    "{{$renderAdjustZanguBtn()}}",
                    {
                        name: "print",
                        component: "PrintButton",
                        className: "print-btn",
                        params:
                            '{{data.other.activeTabKey == 1 ? {codeType: "ZGRK"} : {codeType: "ZGHC"}}}',
                        dealData: "{{$dealData}}",
                    },
                    {
                        name: "batch3",
                        component: "Dropdown",
                        trigger: '{{["click"]}}',
                        children: {
                            name: "internal",
                            component: "Button",
                            className: "app-asset-list-header-more",
                            children: [
                                {
                                    name: "word",
                                    component: "::span",
                                    children: "更多",
                                },
                                {
                                    name: "more",
                                    component: "Icon",
                                    type: "down",
                                },
                            ],
                        },
                        overlay: {
                            name: "menu",
                            component: "Menu",
                            onClick: "{{$moreActionClick}}",
                            children: [
                                {
                                    name: "intelligence",
                                    component: "Menu.Item",
                                    className: "app-asset-list-disposal",
                                    _visible:
                                        "{{data.other.activeTabKey == 1 && !data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    key: "intelligence",
                                    disabled: "{{data.limit.stateNow}}",
                                    children: "智能暂估",
                                },
                                {
                                    name: "insertProofConfirm",
                                    component: "Menu.Item",
                                    disabled: "{{data.limit.stateNow}}",
                                    className: "app-asset-list-disposal",
                                    _visible:
                                        "{{data.other.activeTabKey == 1 && !data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    key: "insertProofConfirm",
                                    children: "按先进先出冲回",
                                },
                                {
                                    name: "insertProofConfirmList",
                                    component: "Menu.Item",
                                    disabled: "{{data.limit.stateNow}}",
                                    className: "app-asset-list-disposal",
                                    _visible:
                                        "{{data.other.activeTabKey == 1 && !data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    key: "insertProofConfirmList",
                                    children: "按暂估明细冲回",
                                },
                                {
                                    _visible: "{{!data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    name: "deleteBill",
                                    component: "Menu.Item",
                                    disabled: "{{data.limit.stateNow}}",
                                    className: "app-asset-list-disposal",
                                    key: "deleteBill",
                                    children: "删除单据",
                                },
                                {
                                    _visible: "{{!data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    name: "supplement",
                                    component: "Menu.Item",
                                    className: "app-asset-list-disposal",
                                    key: "deletePz",
                                    children: "删除凭证",
                                },
                                {
                                    _visible: "{{!data.xdzOrgIsStop}}", // 已停用的账户不显示
                                    name: "import",
                                    component: "Menu.Item",
                                    className: "app-asset-list-disposal",
                                    key: "dataImport",
                                    disabled: "{{data.limit.isCarryOverMainCost}}",
                                    children: "导入",
                                },
                                {
                                    name: "exportData",
                                    component: "Menu.Item",
                                    className: "app-asset-list-disposal",
                                    key: "exportData",
                                    children: "导出",
                                },
                            ],
                        },
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
            defaultPickerValue: "",
            isShowAdjust: false,
            limit: {
                stateNow: "",
            },
            inputVal: "",
            input: "",
            list: [],
            pagination: {
                current: 1,
                total: 0,
                pageSize: 50,
            },
            paginationList: {
                current: 1,
                total: 0,
                pageSize: 50,
            },
            other: {
                activeTabKey: "1",
                isShowFirstTab: true,
            },
            form: {
                strDate: "",
                endDate: "",
                constom: "",
                startTime: "",
                endTime: "",
                supplier: "",
                voucherIds: null,
                voucherName: "",
                voucherIds2: null,
                voucherName2: "",
            },
            selectvalue: "按先进先出冲回",
        },
    }
}
