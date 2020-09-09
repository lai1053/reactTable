export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "inv-app-fastAuthentication-customsList",
        children: [
            {
                name: "head",
                component: "::span",
                className: "inv-app-fastAuthentication-customsList-head",
                children: [
                    {
                        name: "filter",
                        component: "AppLoader",
                        data: "{{data.filter}}",
                        onChange: "{{$handerFilter}}",
                        appName: "inv-app-fastAuthentication-customsList-filterApp"
                    },
                    {
                        name: "skssq",
                        component: "::span",
                        className: "inv-app-fastAuthentication-customsList-skssq",
                        children: [
                            {
                                name: "label",
                                component: "::label",
                                children: "税款所属期："
                            },
                            {
                                name: "tax-date-picker",
                                component: "::span",
                                children: ["{{$renderSkssq()}}"]
                            }
                        ]
                    },
                    {
                        name: "button",
                        component: "::span",
                        className: "inv-app-fastAuthentication-customsList-headButton",
                        children: [
                            {
                                name: "shuaxin",
                                component: "Button",
                                type: "primary",
                                children: "刷新 ",
                                style: {marginRight: "8px", letterSpacing: "2px"},
                                _visible: true,
                                onClick: "{{$refresh}}"
                            },
                            {
                                name: "daiduibishujudaochu",
                                component: "Button",
                                children: "待比对数据导出",
                                type: "primary",
                                style: {marginRight: "8px"},
                                _visible: true,
                                onClick: "{{$contrastData}}"
                            },
                            {
                                name: "more",
                                component: "Dropdown",
                                overlay: {
                                    name: "menu",
                                    component: "Menu",
                                    onClick: "{{$moreActionOpeate}}",
                                    children: [
                                        {
                                            name: "import",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "import",
                                            children: "导入"
                                        },
                                        {
                                            name: "supplement",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "newIncreased",
                                            children: "新增"
                                        },
                                        {
                                            name: "onCollectResultModal",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "deleteBatchClick",
                                            children: "删除"
                                        },
                                        {
                                            name: "Download",
                                            component: "Menu.Item",
                                            className: "app-asset-list-disposal",
                                            key: "download",
                                            children: "下载发票"
                                        }
                                    ]
                                },
                                children: {
                                    name: "internal",
                                    component: "Button",
                                    className: "app-asset-list-header-more",
                                    children: [
                                        {
                                            name: "word",
                                            component: "::span",
                                            children: "更多"
                                        },
                                        {
                                            name: "more",
                                            component: "Icon",
                                            type: "down"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                name: "tables",
                component: "Table",
                className: "inv-app-fasAuthentication-list",
                key: "00",
                rowSelection: undefined,
                bordered: true,
                checkboxChange: "{{$checkboxChange}}",
                scroll: "{{data.list.length > 0 ? data.tableOption : {} }}",
                dataSource: "{{data.list}}",
                columns: "{{data.columns}}",
                loading: "{{data.loading}}",
                checkboxKey: "id",
                pagination: false,
                delay: 600,
                rowKey: "id",
                checkboxValue: "{{data.tableCheckbox.checkboxValue}}",
                onRow: "{{$doubleClick}}"
            },
            {
                name: "footer",
                className: "inv-app-fastAuthentication-list-footer",
                component: "::div",
                children: ["{{$renderFooterAmount()}}"]
            }
        ]
    };
}

export function getInitState() {
    return {
        data: {
            skssq: "",
            filter: {
                form: {},
                ticketTypeList: []
            },
            loading: false,
            tableKey: 1000,
            columns: [
                {
                    title: "缴款书号码",
                    dataIndex: "fphm",
                    width: 200,
                    align: "center"
                },
                {
                    title: "开票日期",
                    dataIndex: "kprq2",
                    width: 120,
                    align: "center"
                },
                {
                    title: "进口口岸代码",
                    dataIndex: "sf01",
                    width: 100,
                    align: "center"
                },
                {
                    title: "进口口岸名称",
                    dataIndex: "sf02",
                    width: 200,
                    align: "center"
                },
                {
                    title: "金额",
                    dataIndex: "hjje",
                    width: 100,
                    align: "center"
                },
                {
                    title: "税额",
                    dataIndex: "hjse",
                    width: 120,
                    align: "center"
                },
                {
                    title: "状态",
                    dataIndex: "bdzts",
                    width: 80,
                    align: "center"
                    //  render: "{{function(text, record){return $renderAction(record);}}}",
                }
            ],
            list: [],
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            selectedRowKeys: [],
            tableOption: {},
            statistics: {
                count: 0,
                totalAmount: 0,
                totalTax: 0
            },
            pagination: {
                pageSize: 20,
                currentPage: 1,
                totalCount: 0
            },
            invoiceVersion: 0,
            dkMonthDsib: false,
            zzsfile: "",
            hgfile: "",
            zzsOriginalName: "",
            hgOriginalName: "",
            zzsCanUpload: true,
            hgCanUpload: true,
            importType: "",
            visible: false,
            helpTooltip: ""
        }
    };
}
