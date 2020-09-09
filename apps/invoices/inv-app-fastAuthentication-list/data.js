export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-fastAuthentication-list',
		children: [{
			name: 'root-content',
			component: '::div',
            className:'inv-app-fastAuthentication-list-content',
			children: [
				{
					name: 'list',
					component: '::div',
					className: 'inv-app-fastAuthentication-list-head',
					children: [
            { name: 'tabs',
              component: 'Tabs',
              className: 'inv-app-fastAuthentication-list-tabs',
              tabPosition: 'top',
              activeKey: '{{data.tabFilter.trans_catagory}}',
              onChange: '{{$tabChange}}',
              children: [
                {
                  name: 'zzszyfp',
                  component: 'Tabs.TabPane',
                  key: '1',
                  tab: '增值税专用发票',
                },
                {
                  name: 'hgzyjks',
                  component: 'Tabs.TabPane',
                  key: '2',
                  tab: '海关专用缴款书',
                }
              ]
            },
            {
					    name: 'zzszyfpList',
              component: '::div',
              _visible:"{{data.tabFilter.trans_catagory === '1'}}",
              className: 'inv-app-fastAuthentication-list-head-div',
              children:[
                {
                  name: 'filterAPP',
                  component: '::div',
                  style:{
                    height:50,
                  },
                  children: [
                    {
                      name: 'filterAPP',
                      component: 'AppLoader',
                      appName: 'inv-app-fastAuthentication-filterApp',
                      data: '{{data.filter}}',
                      onChange: "{{$handerFilter}}",
                    },{
                      name: 'promptContent',
                      component: '::span',
                      className: 'inv-app-fastAuthentication-list-headSpan',
                      children:'快速认证同扫描认证，本月认证只能下月申报抵扣，与本期申报无关！'
                    },{
                      name: 'headButton',
                      component: '::span',
                      className: 'inv-app-fastAuthentication-list-headButton',
                      children: [
                        {
                          name: 'fasong',
                          component: 'Button',
                          children: '发送认证',
                          type: 'primary',
                          _visible: true,
                          style: { marginRight: '8px'},
                          onClick: '{{$sendAtt}}'
                        },{
                          name: 'shuaxin',
                          component: 'Button',
                          children: '刷新认证结果',
                          type: 'primary',
                          style: { marginRight: '8px'},
                          _visible: true,
                          onClick: '{{$refreshResult}}'
                        },{
                          name: 'more',
                          component: 'Dropdown',
                          overlay: {
                            name: 'menu',
                            component: 'Menu',
                            onClick: '{{$moreActionOpeate}}',
                            children: [
                              {
                                name: 'settlement1',
                                component: 'Menu.Item',
                                className: "app-asset-list-disposal",
                                key: 'exports',
                                children: '导出待认证数据'
                              },
                              {
                                name: 'settlement2',
                                component: 'Menu.Item',
                                className: "app-asset-list-disposal",
                                key: 'downloadPdf4Rz',
                                children: '下载发票'
                              },
                              {
                                name: 'supplement1',
                                component: 'Menu.Item',
                                className: "app-asset-list-disposal",
                                key: 'newIncreased',
                                children: '新增'
                              },
                              {
                                name: 'deleteBatchClick1',
                                component: 'Menu.Item',
                                className: 'app-asset-list-disposal',
                                key: 'deleteBatchClick',
                                children: '删除',
                              },
                              {
                                name: 'deleteBatchClick2',
                                component: 'Menu.Item',
                                className: "app-asset-list-disposal",
                                key: 'importKey',
                                children: '更新秘钥'
                              }
                            ]
                          },
                          children: {
                            name: 'internal',
                            component: 'Button',
                            className: 'app-asset-list-header-more',
                            children: [{
                              name: 'word',
                              component: '::span',
                              children: '更多'
                            }, {
                              name: 'more',
                              component: 'Icon',
                              type: 'down'
                            }]
                          }
                        },
                      ]
                    }
    
                  ]
                },
                {
                  name: 'list',
                  className: 'inv-app-fasAuthentication-list',
                  component: 'Table',
                  key: 13241234,
                  loading:'{{data.loading}}',
                  rowSelection: '{{$rowSelection()}}',
                  bordered: true,
                  scroll: '{{data.tableOption}}',
                  dataSource:'{{data.list}}',
                  pagination: false,
                  delay:200,
                  onRow:'{{$doubleClick}}',
                  columns: [
                    {
                      title: '发票号码',
                      dataIndex: 'fphm',
                      width: 80,
                      align: 'center',
                    }, {
                      title: '开票日期',
                      dataIndex: 'kprq2',
                      width: 120,
                      align: 'center',
                    }, {
                      title: '金额',
                      dataIndex: 'hjje',
                      width: 100,
                      align: 'center',
                    }, {
                      title: '税额',
                      dataIndex: 'hjse',
                      width: 120,
                      align: 'center',
                    }, {
                      title: '销方名称',
                      dataIndex: 'xfmc',
                      width: 200,
                      align: 'center',
                    }, {
                      title: '提交日期',
                      dataIndex: 'fsrq2',
                      width: 100,
                      align: 'center',
                    }, {
                      title: '抵扣月份',
                      dataIndex: 'dkyf',
                      width: 100,
                      align: 'center',
                    }, {
                      title: '状态',
                      dataIndex: 'zts',
                      width: 80,
                      align: 'center',
                      render: "{{function(text,rowData,rowIndex){return $renderTooltips(text,rowData,rowIndex)}}}",
                    }
                  ],
                  rowKey: 'id'
                 },
                {
                  name: 'footer',
                  className: 'inv-app-fastAuthentication-list-footer',
                  component: '::div',
                  children: [
                    {
                      name: 'footer-statics',
                      className: 'inv-app-fastAuthentication-footer-statics',
                      component: '::div',
                      children: [
                        {
                          name: 'check-statics-label',
                          className: 'inv-app-fastAuthentication-footer-statics-label',
                          component: '::span',
                          children: '合计：'
                        },{
                          name: 'check-statics-total-invoices',
                          className: 'inv-app-fastAuthentication-footer-statics-total-invoices',
                          component: '::span',
                          children: '{{" 共 " + data.statistics.count + " 张发票 "}}'
                        },{
                          name: 'check-statics-total-cash',
                          className: 'inv-app-fastAuthentication-footer-statics-total-cash',
                          component: '::span',
                          children: '{{"金额：" + data.statistics.totalAmount + " (元)"}}'
                        },{
                          name: 'check-statics-total-tax',
                          className: 'inv-app-fastAuthentication-footer-statics-total-tax',
                          component: '::span',
                          children: '{{ "税额：" + data.statistics.totalTax + " (元)"}}'
                        }
                      ]
                    },
                    {
                    name: 'pagination',
                    component: 'Pagination',
                    pageSizeOptions: ['20', '50', '100', '200'],
                    showSizeChanger: true,
                    pageSize: '{{data.pagination.pageSize}}',
                    current: '{{data.pagination.currentPage}}',
                    total: '{{data.pagination.totalCount}}',
                    onChange: '{{$pageChanged}}',
                    onShowSizeChange: '{{$pageChanged}}'
                  }
                  ]
                }
              ]
            },
            {
              name: 'customsList-container',
              component: '::div',
              className:'inv-app-fasAuthentication-list-customsList-container',
              _visible:"{{data.tabFilter.trans_catagory === '2'}}",
              children:{
                name: 'customsList',
                component: 'AppLoader',
                appName:'inv-app-fastAuthentication-customsList'
              }
            }
           ]
				},
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			filter: {
      	form:{},
        ticketTypeList:[],
			},
      tabFilter: {
        trans_catagory: '1'
      },
      loading: false,
      iconLoading: false,
      tableKey: 1000,
      list:[],
      tableCheckbox: {
        checkboxValue: [],
        selectedOption: []
      },
      tableOption: {
			 y:400
      },
      searchValue: {
        beginInvoiceDate: null,
        endInvoiceDate: null,
        authenticated: false
      },
      statistics: {
        count: 0,
        totalAmount: 0,
        totalTax: 0
      },
      other: {
        endOpen: false,
        onlyShowSelected: false
      },
      // 分页数据
      pagination: {
        pageSize: 20,
        currentPage: 1,
        totalPage:1,
        totalCount: 20
      },
      listAll:'',
      label:{
			  label1:'请选择税款所属期'
      }
		}
	}
}