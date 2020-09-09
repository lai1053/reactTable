import { generalBtnType, columnData ,tableColumns } from './fixedData'
export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'inv-app-custom-list inv-app-batch-sale-purchase-stat',
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
                  name: 'header-filter-input',
                  component: 'Input',
                  className: 'inv-batch-custom-header-filter-input',
                  type: 'text',
                  placeholder: '请输入商品名称',
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
                                name:'prob',
                                component:'::div',
                                className: 'inv-batch-custom-popover-item1',
                                children:[
                                  {
                                    name: 'label',
                                    component: '::span',
                                    children: '差额-数量绝对值：',
                                    className: 'inv-batch-custom-popover-label'
                                  },
                                  {
                                    name: 'select',
                                    component: 'Select',
                                    className: 'inv-batch-custom-popover-option',
                                    getPopupContainer:
                                        '{{function(trigger) {return trigger.parentNode}}}',
                                    value: '{{data.formContent.slcejdzczfh}}',
                                    onChange:
                                        "{{function (e) {$sf('data.formContent.slcejdzczfh', e)}}}",
                                    children: {
                                      name: 'option',
                                      component: 'Select.Option',
                                      children:
                                          '{{data.saleInvoiceType[_rowIndex].name}}',
                                      value:
                                          '{{data.saleInvoiceType[_rowIndex].value}}',
                                      _power: 'for in data.saleInvoiceType'
                                    }
                                  },
                                  {
                                    name: 'input',
                                    component: 'Input.Number',
                                    type: 'text',
                                    placeholder: '0.000000',
                                    value: '{{data.formContent.slcejdz}}',
                                    onChange:
                                        "{{function (e) {$ceChange(e,'sl')}}}",
                                  }
                                ]
                              },
                              {
                                name:'proc',
                                component:'::div',
                                className: 'inv-batch-custom-popover-item1',
                                children:[
                                  {
                                    name: 'label',
                                    component: '::span',
                                    children: '差额-金额绝对值：',
                                    className: 'inv-batch-custom-popover-label'
                                  },
                                  {
                                    name: 'select',
                                    component: 'Select',
                                    className: 'inv-batch-custom-popover-option',
                                    getPopupContainer:
                                        '{{function(trigger) {return trigger.parentNode}}}',
                                    value: '{{data.formContent.jecejdzczfh}}',
                                    onChange:
                                        "{{function (e) {$sf('data.formContent.jecejdzczfh', e)}}}",
                                    children: {
                                      name: 'option',
                                      component: 'Select.Option',
                                      children:
                                          '{{data.saleInvoiceType[_rowIndex].name}}',
                                      value:
                                          '{{data.saleInvoiceType[_rowIndex].value}}',
                                      _power: 'for in data.saleInvoiceType'
                                    }
                                  },
                                  {
                                    name: 'input',
                                    component: 'Input.Number',
                                    type: 'text',
                                    placeholder: '0.00',
                                    value: '{{data.formContent.jecejdz}}',
                                    onChange:
                                        "{{function (e) {$ceChange(e)}}}",
                                  }
                                ]
                              },
                              {
                                name:'prod',
                                component: "::div",
                                _visible:'{{data.mode === 2 || data.mode === 3}}',
                                className: 'inv-batch-custom-popover-item2',
                                children: [
                                  {
                                    name: 'label',
                                    component: '::span',
                                    children: '规格型号：',
                                    className: 'inv-batch-custom-popover-322'
                                  },
                                  {
                                    name:'span',
                                    component:'::span',
                                    className:'inv-batch-custom-popover-123',
                                    children:{
                                      name: 'input',
                                      component: 'Input',
                                      type: 'text',
                                      placeholder: '请输入规格型号，可模糊查询',
                                      value: '{{data.formContent.ggxh}}',
                                      onChange:
                                          "{{function (e) {$sf('data.formContent.ggxh', e.target.value)}}}",
                                    }
                                  }
                                ]
                              },
                              {
                                name:'proe',
                                component: "::div",
                                _visible:'{{data.mode === 3}}',
                                className: 'inv-batch-custom-popover-item2',
                                children: [
                                  {
                                    name: 'label',
                                    component: '::span',
                                    children: '单位：',
                                    className: 'inv-batch-custom-popover-321'
                                  },
                                  {
                                    name:'span',
                                    component:'::span',
                                    className:'inv-batch-custom-popover-123',
                                    children:{
                                      name: 'input',
                                      component: 'Input',
                                      type: 'text',
                                      placeholder: '请输入单位，可模糊查询',
                                      value: '{{data.formContent.dw}}',
                                      onChange:
                                          "{{function (e) {$sf('data.formContent.dw', e.target.value)}}}",
                                    }
                                  }
                                ]
                              }
                              
                            ]
                          },
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
                  className: 'tax-month2 header-item',
                  children: [
                    {
                      name: 'label',
                      component: '::label',
                      children: '开票月份：'
                    },
                    {
                      name: 'tax-date-picker',
                      component: 'DatePicker.MonthPicker',
                      value: '{{data.nsqj}}',
                      format: 'YYYY-MM',
                      disabledDate: '{{$disabledDate}}',
                      onChange: '{{function(e){$sf("data.nsqj",e),$load()}}}'
                    },
                    {
                      name: '-',
                      component: '::span',
                      children: '-'
                    },
                    {
                      name: 'tax-date-picker2',
                      component: 'DatePicker.MonthPicker',
                      value: '{{data.nsqj2}}',
                      format: 'YYYY-MM',
                      disabledDate: '{{$disabledDate2}}',
                      onChange: '{{function(e){$handleMonthPickerChange(e)}}}'
                    }
                  ]
                },
                {
                  name: "radio",
                  component: 'Radio.Group',
                  onChange: "{{function (e) {$modeChange(e.target.value)}}}",
                  value: '{{data.mode}}',
                  children: [
                    {
                      name: 'radio1',
                      component: 'Radio',
                      value: 1,
                      children: '商品'
                    },
                    {
                      name: 'radio1',
                      component: 'Radio',
                      value: 2,
                      children: '商品+规格'
                    },
                    {
                      name: 'radio1',
                      component: 'Radio',
                      value: 3,
                      children: '商品+规格+单位'
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
                  name: 'inv-batch-custom-header-right-help-tooltip',
                  component: 'Tooltip',
                  _power: 'for in data.btnType',
                  title: "{{data.btnType[_rowIndex].name !== 'invoice' ? data.helpTooltip: ''}} ",
                  placement: "bottomLeft",
                  overlayClassName: 'inv-batch-custom-header-right-help-tooltip',
                  style: {
                    display: "inline-block",
                    backgroundColor: "white"
                  },
                  children: {
                    name: '{{data.btnType[_rowIndex].name}}',
                    style: {
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
            }
          ]
        },
        { 
          name: '{{data.TaxpayerNature}}',
          component: '::div',
          children: '{{$renderTable()}}',
        },
        // {
        //   name: '{{data.TaxpayerNature}}',
        //   className: 'inv-batch-custom-table',
        //   component: 'Table',
        //   key: '{{data.TaxpayerNature}}',
        //   bordered: true,
        //   scroll: '{{data.list.length?data.tableOption:undefined}}',
        //   dataSource: '{{data.list}}',
        //   columns: '{{$renderColumns()}}',
        //   pagination: false,
        //   rowKey: 'qyId',
        //   emptyShowScroll: true,
        //   delay: 0
        // },
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
      mode: 1,
      // modeMonth: ['month', 'month'],
      // showTime:{
      //   hideDisabledOptions:true,defaultValue:[202001,202002]
      // },
      openMonth: false,
      modeValue: [],
      userDetail: '',
      btnType: '',
      TaxpayerNature: '0',
      nsqj: '',
      nsqj2: '',
      khRangeList: [
        {
          rangeName: '分配给我的客户',
          rangeType: 'self'
        }
      ],
      khRange: 'self',
      inputVal: '',
      filterForm: {
     
      },
      filterFormOld: {
        jecejdzczfh:'',
        jecejdz:'',
        slcejdzczfh:'',
        slcejdz:'',
        dw:'',
        ggxh:''
      },
      formContent: {
        jecejdzczfh:'',
        jecejdz:'',
        slcejdzczfh:'',
        slcejdz:'',
        dw:'',
        ggxh:''
      },
      saleInvoiceType: [
        {
          name: '≥',
          value: 1
        },
        {
          name: '=',
          value: 2
        },
        {
          name: '≤',
          value: 3
        },
      ],
      loading: false,
      list: [
        {
          hwmc: "螺丝钉",
          ggxh: '1*1',
          dw: '个',
          xxsl: '3',
          xxje: '3.22',
          jxsl: '2',
          jxje: '5.55',
          cesl: '1.23',
          ceje: '4.22'
        }
      ],
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
      helpTooltip: '',
      scroll: {
        x:
          (
            document.querySelector(
              ".edfx-app-portal-content-main"
            ) || document.body
          ).offsetWidth - 16
      },
      tableColumns:[]
    }
  }
}
