export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "ttk-stock-app-statements-zg-container",
        children: [
            {
                name: "ttk-stock-app-spin",
                className: "ttk-stock-app-spin",
                component: "::div",
                _visible: "{{data.loading}}",
                children: "{{$stockLoading()}}",
            },
            {
                _visible: "{{data.isUnOpen}}",
                name: "ttk-stock-weikaiqi",
                className: "ttk-stock-weikaiqi",
                component: "AppLoader",
                appName: "ttk-stock-app-weikaiqi",
            },
            {
                name: "content",
                component: "::div",
                className: "{{$heightCount()}}",
                _visible: "{{!data.isUnOpen && data.isVisible}}",
                children: [
                    {
                        name: "left",
                        component: "Card",
                        className: "{{'ttk-stock-app-statements-zg-detail-left '+data.imgbac}}",
                        extra: {
                            name: "header",
                            component: "::div",
                            children: [
                                {
                                    name: "header-filter-input",
                                    component: "Input",
                                    type: "text",
                                    value: "{{data.inputVal}}",
                                    placeholder: "存货编码/名称",
                                    className: "inv-app-batch-sale-header-filter-input",
                                    onPressEnter:
                                        "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
                                    prefix: {
                                        name: "search",
                                        component: "Icon",
                                        type: "search",
                                    },
                                },
                            ],
                        },
                        children: [
                            {
                                name: "ttk-stock-app-spin",
                                className: "ttk-stock-app-spin",
                                component: "::div",
                                _visible: "{{data.treeLoading}}",
                                children: {
                                    name: "ttk-stock-app-inventory-picking-fast-spin-icon",
                                    className: "ttk-stock-app-inventory-picking-fast-spin-icon",
                                    component: "Spin",
                                    size: "large",
                                    tip: "数据加载中......",
                                    delay: 10,
                                },
                            },
                            {
                                name: "tree",
                                component: "Tree",
                                className: "ttk-stock-app-statements-zg-detail-tree",
                                expandedKeys: "{{data.expandedKeys}}",
                                selectedKeys: "{{data.treeSelectedKey}}",
                                onSelect: "{{$selectType}}",
                                onExpand: "{{$updateExpandedKeys}}",
                                children: "{{$renderTreeNodes(data.other.tree)}}",
                            },
                        ],
                    },
                    {
                        name: "content",
                        component: "Card",
                        className: "ttk-stock-app-statements-zg-detail-content",
                        children: [
                            {
                                name: "arrow",
                                component: "::span",
                                className:
                                    '{{"ttk-stock-app-statements-zg-detail-content-arrow "+data.imgbac}}',
                                onClick: "{{$clickArrow}}",
                            },
                            {
                                name: "title",
                                component: "::div",
                                className: "ttk-stock-app-statements-zg-detail-content-title",

                                children: "{{$renderHeader()}}",
                            },
                            {
                                name: "content",
                                component: "Layout",
                                className:
                                    "ttk-stock-app-statements-zg-detail-contentlist mk-layout",
                                children: "{{$renderTable()}}",
                            },
                        ],
                    },
                ],
            },
        ],
    }
}
//edfx-business-subject-manage
export function getInitState() {
    return {
        data: {
            // arrowLeft: true,
            // imgbac: imgLeft,
            imgbac: "",
            limit: {
                stateNow: "",
            },
            level: 1,
            // columnData,
            inputVal: "",
            isUnOpen: false,
            isVisible: false,
            loading: false,
            treeLoading: false,
            tableOption: {
                x: 1000,
                y: 340,
            },
            form: {
                enableDate: sessionStorage["stockPeriod" + name],
            },
            columns: [],
            list: [
                {
                    inventoryId: 4740671699396608, //--存货id
                    inventoryCode: "0001", //--存货编号
                    inventoryName: "测试存货商品", // --存货名称
                    inventoryGuiGe: "CI-4 20W/50", //--规格型号
                    inventoryUnit: "个", //--单位

                    StockDetailSubDtoList: [
                        {
                            serviceTypeId: 11, //--业务类型Id
                            serviceTypeName: "期初", //--业务类型名称
                            sheetDate: "2019-08-20", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "6869208715736064", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "6869208715736064", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: 100, // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: 100, //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: 100, //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                        {
                            serviceTypeId: 22, //--业务类型Id
                            serviceTypeName: "暂估入库", //--业务类型名称
                            sheetDate: "2019-08-20", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "6869208715736064", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "6869208715736064", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: 100, // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: 100, //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: 100, //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                        {
                            serviceTypeId: 33, //--业务类型Id
                            serviceTypeName: "暂估冲回", //--业务类型名称
                            sheetDate: "2019-08-20", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "6869208715736064", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "6869208715736064", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: 100, // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: 100, //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: 100, //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                        {
                            serviceTypeId: 33, //--业务类型Id
                            serviceTypeName: "暂估冲回", //--业务类型名称
                            sheetDate: "2019-08-20", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "6869208715736064", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "6869208715736064", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: 100, // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: 100, //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: 100, //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                        {
                            serviceTypeId: "", //--业务类型Id
                            serviceTypeName: "本月合计", //--业务类型名称
                            sheetDate: "", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: "", // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: "", //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: "", //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                        {
                            serviceTypeId: "", //--业务类型Id
                            serviceTypeName: "本年累计", //--业务类型名称
                            sheetDate: "", //--日期
                            sheetTitleId: 4740671699396608, //--出入库单据Id
                            sheetCode: "", //--出入库单据号
                            relatedSheetId: 4740671699396608, //--关联单据Id
                            relatedSheetCode: "", // --关联单据号
                            zgrkNum: 10, //--暂估入库数量
                            zgrkPrice: "", // --暂估入库单价
                            zgrkBalance: 1000, // --暂估入库金额
                            zghcNum: 10, //--暂估回冲数量
                            zghcPrice: "", //--暂估回冲单价
                            zghcBalance: 1000, //--暂估回冲金额
                            bqkcNum: 10, //--本期库存数量
                            bqkcPrice: "", //--本期库存单价
                            bqkcBalance: 1000, //--本期库存金额
                        },
                    ],
                },
            ],
            expandedKeys: [],
            other: {
                tree: [],
            },
            treeSelectedKey: ["0"], //选中的数据
            expandedKeys: ["0"], //哪些展开 第一层  ID
        },
    }
}
