import { btnType, more, columnData, columnData2, filterFormOld } from "./fixedData"
import React from "react"
import { Resizable } from "react-resizable"
const ResizeableTitle = props => {
    const { onResize, width, ...restProps } = props

    if (!width) {
        return <th {...restProps} />
    }

    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}>
            <th {...restProps} />
        </Resizable>
    )
}
export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "inv-app-batch-purchase-list",
        children: {
            name: "spin-box",
            component: "Spin",
            spinning: "{{data.loading}}",
            delay: 1,
            wrapperClassName: "spin-box",
            size: "large",
            tip: "数据处理中...",
            children: [
                {
                    name: "tablesetting",
                    component: "TableSettingCard",
                    data: "{{data.other.columnDto}}",
                    showTitle: "{{data.showTitle}}",
                    positionClass: "inv-app-batch-purchase-table",
                    visible: "{{data.showTableSetting}}",
                    confirmClick:
                        "{{function(data){$upDateTableSetting({value: false, data: data})}}}",
                    cancelClick: "{{function(){$closeTableSetting()}}}",
                    resetClick: "{{function(){$resetTableSetting({data: data})}}}",
                },
                {
                    name: "inv-app-batch-purchase-header",
                    component: "::div",
                    className: "inv-app-batch-purchase-header",
                    children: [
                        {
                            name: "header-left",
                            className: "header-left",
                            component: "::div",
                            children: [
                                {
                                    name: "year-period",
                                    component: "::span",
                                    className: "label-item header-item",
                                    children: [
                                        {
                                            name: "label",
                                            component: "::label",
                                            children: "报税月份：",
                                        },
                                        {
                                            name: "tax-date-picker",
                                            component: "DatePicker.MonthPicker",
                                            value: "{{data.nsqj}}",
                                            format: "YYYY-MM",
                                            onChange: "{{$handleMonthPickerChange}}",
                                        },
                                    ],
                                },
                                {
                                    name: "header-filter-input",
                                    component: "Input",
                                    className: "inv-app-batch-purchase-header-filter-input",
                                    type: "text",
                                    placeholder: "请输入销方名称",
                                    onPressEnter: "{{$onSearch}}",
                                    onChange:
                                        "{{function (e) {$sf('data.inputVal', e.target.value)}}}",
                                    prefix: {
                                        name: "search",
                                        component: "Icon",
                                        type: "search",
                                    },
                                },
                                {
                                    name: "popover",
                                    component: "Popover",
                                    popupClassName: "inv-batch-purchase-list-popover",
                                    placement: "bottom",
                                    title: "",
                                    content: {
                                        name: "popover-content",
                                        component: "::div",
                                        className: "inv-batch-custom-popover-content",
                                        children: [
                                            {
                                                name: "filter-content",
                                                component: "::div",
                                                className: "filter-content",
                                                children: [
                                                    {
                                                        name: "popover-sale",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "发票种类：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "select",
                                                                component: "Select",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                getPopupContainer:
                                                                    "{{function(trigger) {return trigger.parentNode}}}",
                                                                value:
                                                                    "{{data.formContent.invType}}",
                                                                onChange:
                                                                    "{{function (e) {$sf('data.formContent.invType', e)}}}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.invTypes[_rowIndex].fpzlMc}}",
                                                                    value:
                                                                        "{{data.invTypes[_rowIndex].fpzlDm}}",
                                                                    _power: "for in data.invTypes",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "popover-code",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "发票代码：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "code-input",
                                                                component: "Input",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                value:
                                                                    "{{data.formContent.invCode}}",
                                                                onChange:
                                                                    "{{function (e) {$sf('data.formContent.invCode', e.target.value)}}}",
                                                                placeholder: "请输入发票代码",
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "popover-number",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "发票号码：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "number-input",
                                                                component: "Input",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                value:
                                                                    "{{data.formContent.invNumber}}",
                                                                onChange:
                                                                    "{{function (e) {$sf('data.formContent.invNumber', e.target.value)}}}",
                                                                placeholder: "请输入发票号码",
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "popover-month",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        _visible:
                                                            "{{data.swVatTaxpayer === '0' && data.invCertificate === '1'}}",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "抵扣月份：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "month-select",
                                                                component: "Select",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                disabled: "{{data.dkMonthDsib}}",
                                                                getPopupContainer:
                                                                    "{{function(trigger) {return trigger.parentNode}}}",
                                                                value:
                                                                    "{{data.formContent.dkMonth}}",
                                                                onChange:
                                                                    "{{function (e) {$sf('data.formContent.dkMonth', e)}}}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.dkMonthDsib== true ? '全部' :data.dkMonth[_rowIndex]}}",
                                                                    value:
                                                                        "{{data.dkMonth[_rowIndex]}}",
                                                                    _power: "for in data.dkMonth",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "bdlyLx",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        _visible:
                                                            "{{data.swVatTaxpayer === '0' && data.invCertificate === '1'}}",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "申报用途：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "select",
                                                                component: "Select",
                                                                placeholder: "请选择",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                onChange:
                                                                    "{{function(val){$sbytSelection(val)}}}",
                                                                value:
                                                                    "{{data.formContent.bdlyLx}}",
                                                                getPopupContainer:
                                                                    "{{function(trigger){return trigger.parentNode} }}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.bdlyLx[_rowIndex].label}}",
                                                                    value:
                                                                        "{{String(data.bdlyLx[_rowIndex].value)}}",
                                                                    _power: "for in data.bdlyLx",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "popover-tax",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "税率：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "tax-select",
                                                                component: "Select",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                getPopupContainer:
                                                                    "{{function(trigger) {return trigger.parentNode}}}",
                                                                value:
                                                                    "{{data.formContent.taxRate}}",
                                                                onChange:
                                                                    "{{function (e) {$sf('data.formContent.taxRate', e)}}}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.taxRates[_rowIndex].slvMc}}",
                                                                    value:
                                                                        "{{data.taxRates[_rowIndex].slv}}",
                                                                    _power: "for in data.taxRates",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "bill-date",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "开票日期：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "rangePicker",
                                                                component: "DatePicker.RangePicker",
                                                                disabledDate: "",
                                                                value:
                                                                    "{{[$stringToMoment((data.formContent.strDate),'YYYY-MM-DD'), $stringToMoment((data.formContent.endDate),'YYYY-MM-DD')]}}",
                                                                onChange:
                                                                    "{{function(v, arr){$sf('data.formContent.strDate', $momentToString(arr[0],'YYYY-MM-DD')); " +
                                                                    "$sf('data.formContent.endDate', $momentToString(arr[1],'YYYY-MM-DD'))}}}",
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
                                                        name: "up-date",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "上传日期：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "rangePicker",
                                                                component: "DatePicker.RangePicker",
                                                                disabledDate: "",
                                                                value:
                                                                    "{{[$stringToMoment((data.formContent.uploadStarDate),'YYYY-MM-DD'), $stringToMoment((data.formContent.uploadEndDate),'YYYY-MM-DD')]}}",
                                                                onChange:
                                                                    "{{function(v, arr){$sf('data.formContent.uploadStarDate', $momentToString(arr[0],'YYYY-MM-DD')); " +
                                                                    "$sf('data.formContent.uploadEndDate', $momentToString(arr[1],'YYYY-MM-DD'))}}}",
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
                                                        name: "isDzfp",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "是否电子票：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "select",
                                                                component: "Select",
                                                                placeholder: "请选择",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                onChange:
                                                                    "{{function(val){$sf('data.formContent.isDzfp',val)}}}",
                                                                value:
                                                                    "{{data.formContent.isDzfp}}",
                                                                getPopupContainer:
                                                                    "{{function(trigger){return trigger.parentNode} }}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.isDzfp[_rowIndex].label}}",
                                                                    value:
                                                                        "{{String(data.isDzfp[_rowIndex].value)}}",
                                                                    _power: "for in data.isDzfp",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "bdjg",
                                                        component: "::div",
                                                        className: "inv-batch-custom-popover-item",
                                                        /*      _visible:
                                                                                            "{{data.swVatTaxpayer === '0' && data.invCertificate === '1'}}",*/
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "管理状态：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            {
                                                                name: "select",
                                                                component: "Select",
                                                                placeholder: "请选择",
                                                                className:
                                                                    "inv-batch-custom-popover-option",
                                                                onChange:
                                                                    "{{function(val){$sf('data.formContent.bdjg',val)}}}",
                                                                value: "{{data.formContent.bdjg}}",
                                                                getPopupContainer:
                                                                    "{{function(trigger){return trigger.parentNode} }}",
                                                                children: {
                                                                    name: "option",
                                                                    component: "Select.Option",
                                                                    children:
                                                                        "{{data.bdjg[_rowIndex].label}}",
                                                                    value:
                                                                        "{{String(data.bdjg[_rowIndex].value)}}",
                                                                    _power: "for in data.bdjg",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        name: "popover-status",
                                                        component: "::div",
                                                        //className: 'inv-batch-custom-popover-item',
                                                        style: {
                                                            marginLeft: "6px",
                                                            marginBottom: "12px",
                                                            fontSize: "12px",
                                                        },
                                                        children: [
                                                            {
                                                                name: "label",
                                                                component: "::span",
                                                                children: "发票状态：",
                                                                className:
                                                                    "inv-batch-custom-popover-label",
                                                            },
                                                            // {
                                                            //     name: 'status-select',
                                                            //     component: 'Select',
                                                            //     className: 'inv-batch-custom-popover-option',
                                                            //     getPopupContainer:
                                                            //         '{{function(trigger) {return trigger.parentNode}}}',
                                                            //     value: '{{data.formContent.status}}',
                                                            //     onChange:
                                                            //         "{{function (e) {$sf('data.formContent.status', e)}}}",
                                                            //     children: {
                                                            //         name: 'option',
                                                            //         component: 'Select.Option',
                                                            //         children:
                                                            //             '{{data.invoiceStatus[_rowIndex].label}}',
                                                            //         value:
                                                            //             '{{data.invoiceStatus[_rowIndex].value}}',
                                                            //         _power: 'for in data.invoiceStatus'
                                                            //     }
                                                            // },
                                                            {
                                                                name: "Checkbox.Group",
                                                                component: "Checkbox.Group",
                                                                value:
                                                                    "{{data.formContent.statusValue}}",
                                                                onChange:
                                                                    "{{function(e){{$sf('data.formContent.statusValue', e)}}}}",
                                                                children: [
                                                                    {
                                                                        name: "normal",
                                                                        component: "Checkbox",
                                                                        value: "normal",
                                                                        children: "正常",
                                                                    },
                                                                    {
                                                                        name: "hcfp",
                                                                        component: "Checkbox",
                                                                        value: "hcfp",
                                                                        children: "红冲",
                                                                    },
                                                                    {
                                                                        name: "cancelled",
                                                                        component: "Checkbox",
                                                                        value: "cancelled",
                                                                        children: "作废",
                                                                    },
                                                                    {
                                                                        name: "abnormal",
                                                                        component: "Checkbox",
                                                                        value: "abnormal",
                                                                        children: "异常",
                                                                    },
                                                                    {
                                                                        name: "lostControl",
                                                                        component: "Checkbox",
                                                                        value: "lostControl",
                                                                        children: "失控",
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                name: "popover-status2",
                                                                component: "::div",
                                                                className:
                                                                    "inv-batch-custom-popover-item-1",
                                                                //style:'{{paddingTop: "10px"}}',
                                                                children: [
                                                                    {
                                                                        name: "label",
                                                                        component: "::span",
                                                                        children: "查询范围：",
                                                                        className:
                                                                            "inv-batch-custom-popover-label",
                                                                    },
                                                                    {
                                                                        name: "Checkbox.Group",
                                                                        component: "Radio.Group",
                                                                        value:
                                                                            "{{data.formContent.scopeType}}",
                                                                        onChange:
                                                                            "{{function(e){{$sf('data.formContent.scopeType', e.target.value)}}}}",
                                                                        children: [
                                                                            {
                                                                                name: "1",
                                                                                component: "Radio",
                                                                                value: 1,
                                                                                children:
                                                                                    "当期发票",
                                                                            },
                                                                            {
                                                                                name: "2",
                                                                                component: "Radio",
                                                                                value: 2,
                                                                                children:
                                                                                    "所有发票",
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                name: "showCheck",
                                                                component: "::div",
                                                                className:
                                                                    "inv-batch-custom-popover-item",
                                                                /*      _visible:
                                                                                                        "{{data.swVatTaxpayer === '0' && data.invCertificate === '1'}}",*/
                                                                children: [
                                                                    {
                                                                        name: "label",
                                                                        component: "::span",
                                                                        children: "原始票：",
                                                                        className:
                                                                            "inv-batch-custom-popover-label",
                                                                    },
                                                                    {
                                                                        name: "select",
                                                                        component: "Select",
                                                                        placeholder: "请选择",
                                                                        className:
                                                                            "inv-batch-custom-popover-option",
                                                                        onChange:
                                                                            "{{function(val){$sf('data.formContent.showCheck',val)}}}",
                                                                        value:
                                                                            "{{data.formContent.showCheck}}",
                                                                        getPopupContainer:
                                                                            "{{function(trigger){return trigger.parentNode} }}",
                                                                        children: {
                                                                            name: "option",
                                                                            component:
                                                                                "Select.Option",
                                                                            children:
                                                                                "{{data.showCheck[_rowIndex].label}}",
                                                                            value:
                                                                                "{{String(data.showCheck[_rowIndex].value)}}",
                                                                            _power:
                                                                                "for in data.showCheck",
                                                                        },
                                                                    },
                                                                ],
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
                                                        onClick: "{{$filterList}}",
                                                    },
                                                    {
                                                        name: "reset",
                                                        className: "reset-btn",
                                                        component: "Button",
                                                        children: "重置",
                                                        onClick: "{{$resetForm}}",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    trigger: "click",
                                    visible: "{{data.showPopoverCard}}",
                                    onVisibleChange: "{{$handlePopoverVisibleChange}}",
                                    children: {
                                        name: "filterSpan",
                                        component: "::span",
                                        className: "inv-batch-custom-filter-btn header-item",
                                        children: {
                                            name: "filter",
                                            component: "Icon",
                                            type: "filter",
                                        },
                                    },
                                },
                                {
                                    name: "invoice-type",
                                    component: "Radio.Group",
                                    className: "inv-purchase-list-radio",
                                    value: "{{data.invCertificate}}",
                                    onChange: "{{$handleInvCertificateChange}}",
                                    _visible: "{{data.swVatTaxpayer === '0'}}",
                                    children: [
                                        {
                                            name: "yrz",
                                            component: "Radio",
                                            value: "1",
                                            children: "已认证",
                                        },
                                        {
                                            name: "wrz",
                                            component: "Radio",
                                            value: "0",
                                            children: "未认证",
                                        },
                                        {
                                            name: "qb",
                                            component: "Radio",
                                            value: null,
                                            children: "全部",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: "header-right",
                            className: "header-right",
                            component: "::div",
                            children: [
                                {
                                    name: "inv-batch-custom-header-right-help-tooltip",
                                    className: "",
                                    component: "Tooltip",
                                    _power: "for in data.btnType",
                                    title:
                                        "{{data.btnType[_rowIndex].name === 'sale' ? data.helpTooltip : ''}} ",
                                    overlayClassName: "inv-batch-custom-header-right-help-tooltip",
                                    placement: "bottomLeft",
                                    style: {
                                        display: "inline-block",
                                    },
                                    children: {
                                        name: "{{data.btnType[_rowIndex].name}}",
                                        //style:'{{{return{width:800}}}}',
                                        style: {
                                            marginRight: "8px",
                                        },
                                        className: "{{data.btnType[_rowIndex].className}}",
                                        component: "Button",
                                        type: "{{data.btnType[_rowIndex].type}}",
                                        children: "{{data.btnType[_rowIndex].children}}",
                                        disabled: "{{data.btnType[_rowIndex].disabled}}",
                                        onClick:
                                            "{{function () {$judgeIsChoseBill(data.btnType[_rowIndex])}}}",
                                    },
                                },
                                {
                                    name: "moreBtn",
                                    className: "more-drop-down",
                                    component: "Dropdown",
                                    overlayClassName: "more-drop-down-purchase-invoice",
                                    overlay: {
                                        name: "more-menu",
                                        component: "Menu",
                                        onClick: "{{$judgeIsChoseBill}}",
                                        children: "{{$renderMore()}}",
                                        subMenuCloseDelay: 1,
                                    },
                                    children: {
                                        name: "drop-down-btn",
                                        className: "drop-down-btn",
                                        component: "Button",
                                        children: [
                                            "更多",
                                            {
                                                name: "arrow",
                                                className: "drop-down-icon",
                                                component: "Icon",
                                                type: "down",
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "{{data.taxType}}",
                    className: "inv-app-batch-purchase-table",
                    component: "Table",
                    components: "{{data.components}}",
                    key: "{{data.taxType}}",
                    // loading: '{{data.loading}}',
                    rowSelection: "{{$rowSelection()}}",
                    checkboxChange: "{{$checkboxChange}}",
                    bordered: true,
                    scroll: "{{data.tableOption}}",
                    dataSource: "{{data.list}}",
                    columns: "{{$renderColumns()}}",
                    checkboxKey: "kjxh",
                    pagination: false,
                    rowKey: "kjxh",
                    checkboxValue: "{{data.tableCheckbox.checkboxValue}}",
                    emptyShowScroll: true,
                    onRow: "{{$doubleClick}}",
                    //checkboxFixed:true,
                    //allowColResize: true,
                },
                {
                    name: "footer",
                    className: "inv-batch-purchase-list-footer",
                    component: "::div",
                    children: [
                        "{{$renderFooterAmount()}}",
                        {
                            name: "pagination",
                            component: "Pagination",
                            className: "invoice-purchase-list-pagination",
                            pageSizeOptions: ["50", "100", "200", "300"],
                            pageSize: "{{data.pagination.pageSize}}",
                            current: "{{data.pagination.currentPage}}",
                            total: "{{data.pagination.totalCount}}",
                            onChange: "{{$pageChanged}}",
                            onShowSizeChange: "{{$pageChanged}}",
                            showTotal:
                                "{{function (total) {return $renderFooterPagination(total)}}}",
                        },
                    ],
                },
            ],
        },
    }
}

export function getInitState() {
    return {
        data: {
            userDetail: "", // 权限
            btnType: "",
            inputVal: "",
            more,
            // moreOld: more,
            formContent: filterFormOld,
            filterFormOld: filterFormOld,
            filterForm: filterFormOld,
            pagination: {
                currentPage: 1, //-- 当前页
                pageSize: 50, //-- 页大小
                totalCount: 0,
                totalPage: 0,
            },
            list: [],
            invTypes: [],
            taxRates: [],
            invoiceStatus: [
                {
                    label: "全部",
                    value: "",
                    isCommon: true,
                },
                {
                    label: "正常",
                    value: "1",
                    isCommon: true,
                },
                {
                    label: "红冲",
                    value: 1000,
                    isCommon: true,
                },
                {
                    label: "作废",
                    value: "2",
                    isCommon: true,
                },
                {
                    label: "异常",
                    value: "3",
                    isCommon: false,
                },
                {
                    label: "失控",
                    value: "4",
                    isCommon: false,
                },
            ],
            isDzfp: [
                {
                    label: "全部",
                    value: "",
                    isCommon: true,
                },
                {
                    label: "是",
                    value: "Y",
                    isCommon: true,
                },
                {
                    label: "否",
                    value: "N",
                    isCommon: true,
                },
            ],
            dkMonth: ["全部"],
            bdlyLx: [
                {
                    label: "全部",
                    value: "",
                    isCommon: true,
                },
                {
                    label: "抵扣",
                    value: "1",
                    isCommon: true,
                },
                {
                    label: "待抵扣",
                    value: "10",
                    isCommon: true,
                },
                {
                    label: "不抵扣",
                    value: "6",
                    isCommon: true,
                },
                {
                    label: "退税",
                    value: "2",
                    isCommon: true,
                },
                {
                    label: "代办退税",
                    value: "3",
                    isCommon: true,
                },
            ],
            bdjg: [
                {
                    label: "全部",
                    value: "",
                    isCommon: true,
                },
                {
                    label: "正常",
                    value: "0",
                    isCommon: true,
                },
                {
                    label: "异常",
                    value: "1",
                    isCommon: true,
                },
            ],
            showCheck: [
                {
                    label: "全部",
                    value: "",
                    isCommon: true,
                },
                {
                    label: "有",
                    value: "Y",
                    isCommon: true,
                },
                {
                    label: "无",
                    value: "N",
                    isCommon: true,
                },
            ],
            invCertificate: "1",
            sort: {
                userOrderField: "",
                order: "",
            },
            tableOption: { x: 1 },
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: [],
                checkboxFlag: undefined,
            },
            amountData: {
                fpzs: 0,
                totalHjje: 0,
                totalHjse: 0,
                negativeTotalHjje: 0,
                negativeTotalHjse: 0,
                normalFpzs: 0,
                effectiveTotalHjse: 0,
                effectiveNegativeTotalHjse: 0,
                totalNf06: 0,
            },
            amountDataOld: {
                fpzs: 0,
                totalHjje: 0,
                totalHjse: 0,
                negativeTotalHjje: 0,
                negativeTotalHjse: 0,
                normalFpzs: 0,
                effectiveTotalHjse: 0,
                effectiveNegativeTotalHjse: 0,
                totalNf06: 0,
            },
            showTableSetting: false,
            other: {
                columnDto: [],
            },
            taxType: "0",
            loading: true,
            columnData,
            columnData2,
            columns: [],
            oldcolumns: [],
            normalFpzs: 0,
            skssq: "",
            invoiceVersion: 0,
            dkMonthDsib: false,
            zzsfile: "",
            tysfile: "",
            zzsfile2: undefined,
            hgfile: "",
            zzsOriginalName: "",
            zzsOriginalName2: "",
            hgOriginalName: "",
            zzsCanUpload: true,
            hgCanUpload: true,
            importType: "",
            visible: false,
            helpTooltip: "",
            components: {
                header: {
                    cell: ResizeableTitle,
                },
            },
        },
    }
}
