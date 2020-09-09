export function getMeta() {
    //app-account-subjects
    return {
        name: 'root',
        component: '::div',
        className: 'edf-company-manage',
        children: [{
			name: 'ttk',
			component: '::a',
			href: '#',
			style: {display: 'none'},
			id: 'downloadInvoice'
		},{
            name: 'tabs',
            component: 'Tabs',
            animated: false,
            forceRender: false,
            type: 'card',
			activeKey: '{{data.other.activeTabKey}}',
            onChange: '{{$handleTabChange}}',
            className: 'edf-company-manage-tab',
            children: [{
                name: 'tab1',
                component: 'Tabs.TabPane',
				tab: '我的企业',
				forceRender: false,
                key: '1',
                children: [{
                    name: 'header2',
                    component: '::div',
                    _visible:'{{data.other.activeTabKey == 1}}' ,
                    className: 'edf-company-manage-header',
                    children: [{
                        name: 'Search',
                        component: 'Input.Search',
                        onChange: `{{function(e){$fieldChange('data.form.name',e.target.value)}}}`,
                        value: '{{data.form.name}}',
                        className: 'edf-company-manage-header-search',
                        placeholder: "输入企业名称进行搜索",
                    }, {
                        name: 'btnGroup2',
                        component: '::div',
                        className: 'edf-company-manage-header-right',
                        children: [{
                            name: 'btnGroup',
                            component: '::div',
                            _visible: '{{data.hideBackBtn}}',
                            className: 'edf-company-manage-back',
                            children: [{
                                name: 'back',
                                component: 'Button',
                                children: '返回',
                                onClick: '{{$back}}',
                            }]
                        }, {
                            name: 'importAccount',
                            component: 'Button',
                            style: {marginRight: '10px', width: '70px'},
                            _visible: '{{data.appVersion != 104}}',
                            children: '导账',
                            onClick: '{{function(){$toImportAccount(2, 2)}}}',
                        }, {
                            name: 'new',
                            component: 'Button',
                            children: '创建企业',
                            onClick: '{{$addManage}}',
                            className: 'edf-company-manage-header-right-btn'
                        }]
                    }]
                }, {
                    name: 'content',
                    component: '::div',
                    _visible:'{{data.other.activeTabKey == 1}}' ,
                    className: 'edf-company-manage-content',
                    children: [{
                        name: 'dataGrid1',
                        component: 'DataGrid',
                        className: 'manageList',
                        headerHeight: 36,
                        isColumnResizing: true,
                        loading: '{{data.other.loading}}',
                        rowHeight: 36,
                        lineHeight: 36,
                        ellipsis: true,
                        rowsCount: "{{$getListRowsCount()}}",
                        columns: "{{$getListColumns()}}"
                    }]
                }]
            }, {
                name: 'tab2',
				component: 'Tabs.TabPane',
                tab: '我的订单',
                forceRender: false,
                _visible: '{{data.appVersion != 107}}',
                key: '2',
                className: 'edf-company-manage-tab-order',
                children: [{
                    name: 'header2',
                    component: '::div',
                    _visible:'{{data.other.activeTabKey == 2}}' ,
                    className: 'edf-company-manage-header',
                    children: [{
                        name: 'Search',
                        component: 'Input.Search',
                        onChange: `{{function(e){$orderFilter('data.form.orderOrgName',e.target.value)}}}`,
                        value: '{{data.form.orderOrgName || ""}}',
                        className: 'edf-company-manage-header-search',
                        placeholder: "输入企业名称进行搜索",
                    }, {
                        name: 'type',
                        component: '::div',
                        className: 'edf-company-manage-header-condition',
                        children: [{
                            name: 'title',
                            component: '::span',
                            children: '支付方式：'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.payType == 0 ? "typeActive" : ""}}',
                            onClick: '{{function() {$changePayType(0)}}}',
                            children: '全部'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.payType == 2 ? "typeActive" : ""}}',
                            onClick: '{{function() {$changePayType(2)}}}',
                            children: '微信支付'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.payType == 3 ? "typeActive" : ""}}',
                            onClick: '{{function() {$changePayType(3)}}}',
                            children: '支付宝'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.payType == 1 ? "typeActive" : ""}}',
                            onClick: '{{function() {$changePayType(1)}}}',
                            children: '中国银联'
                        }]
                    }, {
                        name: 'status',
                        component: '::div',
                        className: 'edf-company-manage-header-condition',
                        children: [{
                            name: 'title',
                            component: '::span',
                            children: '订单状态：'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.orderStatus == 0 ? "statusActive" : ""}}',
                            onClick: '{{function() {$changeStatus(0)}}}',
                            children: '全部'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.orderStatus == 4 ? "statusActive" : ""}}',
                            onClick: '{{function() {$changeStatus(4)}}}',
                            children: '已完成'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.orderStatus == 1 ? "statusActive" : ""}}',
                            onClick: '{{function() {$changeStatus(1)}}}',
                            children: '待支付'
                        }, {
                            name: 'item1',
                            component: '::span',
                            className: '{{data.orderStatus == 5 ? "statusActive" : ""}}',
                            onClick: '{{function() {$changeStatus(5)}}}',
                            children: '已取消'
                        }]
                    }]
                }, {
                    name: 'content',
                    component: '::div',
                    _visible:'{{data.other.activeTabKey == 2}}' ,
                    className: 'edf-company-manage-content',
                    children: [{
                        name: 'dataGrid2',
                        component: 'DataGrid',
                        className: 'orderList',
                        headerHeight: 36,
                        isColumnResizing: true,
                        loading: '{{data.other.loading}}',
                        rowHeight: 36,
                        lineHeight: 36,
                        ellipsis: true,
                        rowsCount: "{{$getOrderListRowsCount()}}",
                        columns: "{{$getOrderColumns()}}"
                    }]
                }]
            }]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            hideBackBtn: false,
            list: [],
            manageList: [],
            form: {},
            pagination: {
                current: 1,
                total: 0,
                pageSize: 20
            },
            columns: [],
            payType: 0,
            orderStatus: 0,
            other: {
                activeTabKey: '1'
            },
            applyHead: {
                invoiceHead: 1,
                name: '',
                vatTaxpayerNum: ''
            }, 
            orderlist: []
        }
    }
}