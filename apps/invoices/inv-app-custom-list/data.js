import { generalBtnType, columnData } from './fixedData'
export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'inv-app-custom-list',
    children: {
      name: 'spin-box',
      component: 'Spin',
      spinning: '{{data.loading}}',
      delay: 1,
      wrapperClassName: 'spin-box',
      size: 'large',
      tip: '数据处理中...',
      children: [
        {
          name: 'tablesetting',
          component: 'TableSettingCard',
          data: '{{data.other.columnDto}}',
          showTitle: '{{data.showTitle}}',
          positionClass: 'inv-batch-custom-table',
          visible: '{{data.showTableSetting}}',
          confirmClick:
            '{{function(data){$upDateTableSetting({value: false, data: data})}}}',
          cancelClick: '{{function(){$closeTableSetting()}}}',
          resetClick: '{{function(){$resetTableSetting({data: data})}}}'
        },
        {
          name: 'inv-batch-cost-nav',
          component: '::div',
          className: 'inv-batch-custom-list-div',
          children: [
            {
              name: 'inv-batch-nav',
              component: 'Tabs',
              activeKey:'{{data.TaxpayerNature}}',
              onChange: '{{$tabChange}}',
              children: [
                {
                  name: 'general',
                  component: 'Tabs.TabPane',
                  tab: '一般纳税人',
                  key: '0'
                },
                {
                  name: 'small-scale',
                  component: 'Tabs.TabPane',
                  tab: '小规模纳税人',
                  key: '1'
                }
              ]
            }
          ]
        },
        {
          name: 'inv-batch-custom-header',
          component: '::div',
          className: 'inv-batch-custom-header',
          children: [
            {
              name: 'header-left',
              className: 'header-left',
              component: '::div',
              children: [
                {
                  name: 'tree',
                  component: '::span',
                  style: {
                    verticalAlign: 'middle',
                    marginRight: '8px'
                  },
                  children: '{{$renderTree()}}'
                },
                {
                  name: 'header-filter-input',
                  component: 'Input',
                  className: 'inv-batch-custom-header-filter-input',
                  type: 'text',
                  placeholder: '请输入客户名称或助记码',
                  value: '{{data.inputVal}}',
                  onChange:
                    "{{function (e) {$sf('data.inputVal', e.target.value)}}}",
                  onPressEnter: '{{$onSearch}}',
                  prefix: {
                    name: 'search',
                    component: 'Icon',
                    type: 'search'
                  }
                },
                {
                  name: 'popover',
                  component: 'Popover',
                  popupClassName: 'inv-batch-custom-popover',
                  placement: 'bottom',
                  title: '',
                  content: {
                    name: 'popover-content',
                    component: '::div',
                    className: 'inv-batch-custom-popover-content',
                    children: [
                      {
                        name: 'filter-content',
                        component: '::div',
                        className: 'filter-content',
                        children: [
                          {
                            name: 'popover-sale',
                            component: '::div',
                            className: 'inv-batch-custom-popover-item',
                            children: [
                              {
                                name: 'label',
                                component: '::span',
                                children: '销项状态：',
                                className: 'inv-batch-custom-popover-label'
                              },
                              {
                                name: 'select',
                                component: 'Select',
                                className: 'inv-batch-custom-popover-option',
                                getPopupContainer:
                                  '{{function(trigger) {return trigger.parentNode}}}',
                                value: '{{data.formContent.saleStatus}}',
                                onChange:
                                  "{{function (e) {$sf('data.formContent.saleStatus', e)}}}",
                                children: {
                                  name: 'option',
                                  component: 'Select.Option',
                                  children:
                                    '{{data.saleInvoiceType[_rowIndex].name}}',
                                  value:
                                    '{{data.saleInvoiceType[_rowIndex].value}}',
                                  _power: 'for in data.saleInvoiceType'
                                }
                              }
                            ]
                          },
                          {
                            name: 'popover-purchase',
                            component: '::div',
                            className: 'inv-batch-custom-popover-item',
                            children: [
                              {
                                name: 'label',
                                component: '::span',
                                children: '进项状态：',
                                className: 'inv-batch-custom-popover-label'
                              },
                              {
                                name: 'select',
                                component: 'Select',
                                className: 'inv-batch-custom-popover-option',
                                getPopupContainer:
                                  '{{function(trigger) {return trigger.parentNode}}}',
                                value: '{{data.formContent.purchaseStatus}}',
                                onChange:
                                  "{{function (e) {$sf('data.formContent.purchaseStatus', e)}}}",
                                children: {
                                  name: 'option',
                                  component: 'Select.Option',
                                  children:
                                    '{{data.saleInvoiceType[_rowIndex].name}}',
                                  value:
                                    '{{data.saleInvoiceType[_rowIndex].value}}',
                                  _power: 'for in data.saleInvoiceType'
                                }
                              }
                            ]
                          },
                          {
                            name: 'popover-saleje',
                            component: '::div',
                            className: 'inv-batch-custom-popover-item',
                            children: [
                              {
                                name: 'label',
                                component: '::span',
                                children: '销项金额：',
                                className: 'inv-batch-custom-popover-label'
                              },
                              {
                                name: 'select',
                                component: 'Select',
                                className: 'inv-batch-custom-popover-option',
                                getPopupContainer:
                                    '{{function(trigger) {return trigger.parentNode}}}',
                                value: '{{data.formContent.xxfpCjzt}}',
                                onChange:
                                    "{{function (e) {$sf('data.formContent.xxfpCjzt', e)}}}",
                                children: {
                                  name: 'option',
                                  component: 'Select.Option',
                                  children:
                                      '{{data.xxfpCjztType[_rowIndex].name}}',
                                  value:
                                      '{{data.xxfpCjztType[_rowIndex].value}}',
                                  _power: 'for in data.xxfpCjztType'
                                }
                              }
                            ]
                          },
                          {
                            name: 'popover-purchaseje',
                            component: '::div',
                            className: 'inv-batch-custom-popover-item',
                            children: [
                              {
                                name: 'label',
                                component: '::span',
                                children: '进项金额：',
                                className: 'inv-batch-custom-popover-label'
                              },
                              {
                                name: 'select',
                                component: 'Select',
                                className: 'inv-batch-custom-popover-option',
                                getPopupContainer:
                                    '{{function(trigger) {return trigger.parentNode}}}',
                                value: '{{data.formContent.jxfpCjzt}}',
                                onChange:
                                    "{{function (e) {$sf('data.formContent.jxfpCjzt', e)}}}",
                                children: {
                                  name: 'option',
                                  component: 'Select.Option',
                                  children:
                                      '{{data.xxfpCjztType[_rowIndex].name}}',
                                  value:
                                      '{{data.xxfpCjztType[_rowIndex].value}}',
                                  _power: 'for in data.xxfpCjztType'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        name: 'filter-footer',
                        component: '::div',
                        className: 'filter-footer',
                        children: [
                          {
                            name: 'search',
                            component: 'Button',
                            type: 'primary',
                            children: '查询',
                            onClick: '{{$filterList}}'
                          },
                          {
                            name: 'reset',
                            className: 'reset-btn',
                            component: 'Button',
                            children: '重置',
                            onClick: '{{$resetForm}}'
                          }
                        ]
                      }
                    ]
                  },
                  trigger: 'click',
                  visible: '{{data.showPopoverCard}}',
                  onVisibleChange: '{{$handlePopoverVisibleChange}}',
                  children: {
                    name: 'filterSpan',
                    component: '::span',
                    className: 'inv-batch-custom-filter-btn header-item',
                    children: {
                      name: 'filter',
                      component: 'Icon',
                      type: 'filter'
                    }
                  }
                },
                {
                  name: 'tax-month',
                  component: '::span',
                  className: 'tax-month header-item',
                  children: [
                    {
                      name: 'label',
                      component: '::label',
                      children: '报税月份：'
                    },
                    {
                      name: 'tax-date-picker',
                      component: 'DatePicker.MonthPicker',
                      value: '{{data.nsqj}}',
                      format: 'YYYY-MM',
                      onChange: '{{$handleMonthPickerChange}}'
                    }
                  ]
                }
              ]
            },
            {
              name: 'header-right',
              className: 'header-right',
              component: '::div',
              children: [
                {
                  name:'inv-batch-custom-header-right-help',
                  className:'inv-batch-custom-header-right-help',
                  component:'::div',
                  onClick: '{{$openHelp}}',
                  children:''
                },
                {
                  name:'inv-batch-custom-header-right-help-tooltip',
                  component: '::span',
                  children: '{{$renderHeaderBtn()}}'
                  // component:'Tooltip',
                  // _power: 'for in data.btnType',
                  // title:'@@@@',//"{{data.btnType[_rowIndex].tooltipKey === true ? data.helpTooltip: ''}} ",
                  // placement:"bottomLeft",
                  // overlayClassName:'inv-batch-custom-header-right-help-tooltip',
                  // style: {
                  //   display:"inline-block",
                  //   backgroundColor: "white"
                  // },
                  // children: {
                  //   name: '{{data.btnType[_rowIndex].name}}',
                  //   style:{
                  //     marginRight: '8px'
                  //   },
                  //   className: '{{data.btnType[_rowIndex].className}}',
                  //   component: 'Button',
                  //   type: '{{data.btnType[_rowIndex].type}}',
                  //   disabled: '{{data.btnType[_rowIndex].disabled}}',
                  //   children: '{{data.btnType[_rowIndex].children}}',
                  //   onClick:
                  //     '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
                  // }
                }
              ]
            }
          ]
        },
        {
          name: '{{data.TaxpayerNature}}',
          className: 'inv-batch-custom-table',
          component: 'Table',
          key: '{{data.TaxpayerNature}}',
          //loading: '{{data.loading}}',
          checkboxChange: '{{$checkboxChange}}',
          bordered: true,
          scroll: '{{data.list.length?data.tableOption:undefined}}',
          dataSource: '{{data.list}}',
          columns: '{{$renderColumns()}}',
          checkboxKey: 'qyId',
          pagination: false,
          rowKey: 'qyId',
          checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
          checkboxFixed: '{{data.fixedTable}}',
          emptyShowScroll: true,
          delay: 0,
          allowColResize: false,
        },
        {
          name: 'footer',
          className: 'inv-batch-custom-footer',
          component: '::div',
          children: [
            {
              name: 'pagination',
              component: 'Pagination',
              pageSizeOptions: ['50', '100', '200', '300'],
              pageSize: '{{data.pagination.pageSize}}',
              current: '{{data.pagination.currentPage}}',
              total: '{{data.pagination.totalCount}}',
              onChange: '{{$pageChanged}}',
              onShowSizeChange: '{{$pageChanged}}',
              showTotal:
                '{{function (total) {return $renderFooterPagination(total)}}}'
            }
          ]
        }
      ]
    }
  }
}

export function getInitState() {
  return {
    data: {
      invoicePlatForm: 0,
      userDetail: '',
      btnType: [],
      TaxpayerNature: '0',
      nsqj: '',
      khRangeList: [
        {
          rangeName: '分配给我的客户',
          rangeType: 'self'
        }
      ],
      khRange: 'self',
      inputVal: '',
      filterForm: {
        saleStatus: '',
        purchaseStatus: ''
      },
      filterFormOld: {
        saleStatus: '',
        purchaseStatus: '',
        xxfpCjzt:'',
        jxfpCjzt:''
      },
      formContent: {
        saleStatus: '',
        purchaseStatus: '',
        xxfpCjzt:'',
        jxfpCjzt:''
      },
      saleInvoiceType: [
        {
          name: '全部',
          value: ''
        },
        {
          name: '采集成功',
          value: '0'
        },
        {
          name: '采集失败',
          value: '1'
        },
        {
          name: '采集中',
          value: '2'
        },
        {
          name: '未采集',
          value: '3'
        }
      ],
      xxfpCjztType: [
        {
          name: '全部',
          value: ''
        },
        {
          name: '>0',
          value: '0'
        },
        {
          name: '=0',
          value: '1'
        },
        {
          name: '<0',
          value: '2'
        }
      ],
      loading: true,
      list: [],
      tableOption: {
        x: 1500
      },
      pagination: {
        currentPage: 1, //-- 当前页
        pageSize: 50, //-- 页大小
        totalCount: 0,
        totalPage: 0
      },
      showTableSetting: false,
      other: {
        columnDto: [],
        permission: {
          treeData: [], //权限列表
          all: null,
          self: '分配我的客户'
        }
      },
      columnData,
      columns: [],
      tableCheckbox: {
        checkboxValue: [],
        selectedOption: []
      },
      showPopoverCard: false,
      loadTime: '',
      fixedTable: false,
      showbm: '分配给我的客户',
      maxde: '',
      ifgs: '',
      checkedKeys: {
        checked: [], //全选
        halfChecked: [] //半选
      },
      departments: [],
      helpTooltip:''
    }
  }
}
