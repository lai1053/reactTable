export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "ttk-stock-app-statements-sfc-container",
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
                        className: "{{'ttk-stock-app-statements-sfc-detail-left '+data.imgbac}}",
                        extra: {
                            name: "header",
                            component: "::div",
                            children: [
                                {
                                    name: "header-filter-input",
                                    component: "Input",
                                    className: "inv-app-batch-sale-header-filter-input",
                                    type: "text",
                                    placeholder: "存货编码/名称",
                                    value: "{{data.inputVal}}",
                                    onPressEnter:
                                        "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
                                    prefix: {
                                        component: "Icon",
                                        name: "search",
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
                                children: '{{$stockLoading({size: "default"})}}',
                            },
                            {
                                name: "tree",
                                component: "Tree",
                                className: "ttk-stock-app-statements-sfc-detail-tree",
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
                        className: "ttk-stock-app-statements-sfc-detail-content",
                        children: [
                            {
                                name: "arrow",
                                component: "::span",
                                className:
                                    '{{"ttk-stock-app-statements-sfc-detail-content-arrow " + data.imgbac}}',
                                onClick: "{{$clickArrow}}",
                            },
                            {
                                name: "title",
                                component: "::div",
                                className: "ttk-stock-app-statements-sfc-detail-content-title",
                                children: "{{$renderHeader()}}",
                            },
                            {
                                name: "content",
                                component: "Layout",
                                className:
                                    "ttk-stock-app-statements-sfc-detail-contentlist mk-layout",
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
            arrowLeft: true,
            imgbac: "",
            limit: {
                stateNow: "",
            },
            level: 1,
            columnData: [],
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
            list: [],
            expandedKeys: [],
            other: {
                tree: [],
            },
            treeSelectedKey: ["0"], //选中的数据
            expandedKeys: ["0"], //哪些展开 第一层  ID
        },
    }
}
