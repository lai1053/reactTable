import { smallBtnType, columnData } from './fixedData'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-single-custom-small-list',
        children: {
            name: 'spin-box',
            component: 'Spin',
            spinning: '{{data.loading}}',
            delay: 1,
            wrapperClassName: 'spin-box',
            size: 'large',
            tip: '数据处理中...',
            children: [{
                name: 'tablesetting',
                component: 'TableSettingCard',
                data: '{{data.other.columnDto}}',
                showTitle: '{{data.showTitle}}',
                positionClass: 'inv-batch-custom-table',
                visible: '{{data.showTableSetting}}',
                confirmClick: '{{function(data){$upDateTableSetting({value: false, data: data})}}}',
                cancelClick: '{{function(){$closeTableSetting()}}}',
                resetClick: '{{function(){$resetTableSetting({data: data})}}}'
            }, {
                name: 'inv-batch-custom-header',
                component: '::div',
                className: 'inv-batch-custom-header',
                children: [{
                    name: 'header-left',
                    className: 'header-left',
                    component: '::div',
                    children: [{
                        name: 'tax-month',
                        component: '::span',
                        className: 'tax-month header-item',
                        children: [{
                            name: 'label',
                            component: '::label',
                            children: '报税月份：'
                        }, {
                            name: 'tax-date-picker',
                            component: 'DatePicker.MonthPicker',
                            value: '{{data.nsqj}}',
                            format: 'YYYY-MM',
                            onChange: "{{$handleMonthPickerChange}}"
                        }]
                    }]
                }, {
                    name: 'header-right',
                    className: 'header-right',
                    component: '::div',
                    children: [/*{
                            name: 'externalUrl',
                            component: 'Button',
                            className: 'header-btn',
                            type: 'primary',
                            children: '票税宝录票',
                            disabled: '{{data.externalUrlDisable}}',
                            onClick: '{{$externalUrlClick}}',
                        },*/
                        {
                            name:'inv-batch-custom-header-right-help-tooltip',
                            className:'',
                            component:'Tooltip',
                            _power: 'for in data.btnType',
                            title:"{{data.btnType[_rowIndex].name !== 'limit' ? data.helpTooltip: ''}} ",
                            placement:"bottomLeft",
                            overlayClassName:'inv-batch-custom-header-right-help-tooltip',
                            style: {
                                display:"inline-block"
                            },
                            children:{
                                name: '{{data.btnType[_rowIndex].name}}',
                                //style:'{{{return{width:800}}}}',
                                style:{
                                    marginRight: '8px'
                                },
                                className: '{{data.btnType[_rowIndex].className}}',
                                component: 'Button',
                                type: '{{data.btnType[_rowIndex].type}}',
                                disabled: '{{data.btnType[_rowIndex].disabled}}',
                                children: '{{data.btnType[_rowIndex].children}}',
                                onClick:
                                    '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
                            }
                        }
                    ]
                }],
            }, {
                name: 'small-list-table',
                className: 'inv-batch-custom-table',
                component: 'Table',
                key: 'table-small-custom',
                //loading: '{{data.loading}}',
                bordered: true,
                scroll: '{{data.list.length?data.tableOption:undefined}}',
                dataSource: '{{data.list}}',
                columns: '{{$renderColumns()}}',
                pagination: false,
                emptyShowScroll: true
            }]
        },

    }
}

export function getInitState() {
    return {
        data: {
            userDetail:'',
            btnType: '',
            columnData,
            columns: [],
            TaxpayerNature: '0',
            nsqj: '',
            khRangeList: [],
            khRange: 'self',
            inputVal: '',
            filterForm: {
                saleStatus: '',
                purchaseStatus: ''
            },
            filterFormOld: {
                saleStatus: '',
                purchaseStatus: ''
            },
            formContent: {
                saleStatus: '',
                purchaseStatus: ''
            },
            saleInvoiceType: [{
                name: '全部',
                value: ''
            }, {
                name: '采集成功',
                value: '0'
            }, {
                name: '采集失败',
                value: '1'
            }, {
                name: '未采集',
                value: '2'
            }],
            tableKey: 'inv-batch-custom-content',
            loading: false,
            list: [],
            tableOption: {

            },
            pagination: {
                currentPage: 1, //-- 当前页
                pageSize: 30, //-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            showTableSetting: false,
            other: {
                columnDto: [],
            },
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            showPopoverCard: false,
            loadTime: '',
            columnsWidth: 0,
            externalUrlDisable: true,
            externalUrl: null,
            helpTooltip:''
        }
    }
}