// import moment from 'moment'
export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'app-auxbalancesum-rpt',
    children: [{
      name: 'body',
			component: 'Layout',
            className: 'app-auxbalancesum-rpt-body',
            children:[{
				name: 'left',
				component: '::div',
				className: 'app-auxbalancesum-rpt-body-left',
				_visible: '{{$renderTimeLineVisible()}}',
				children: '{{$renderTimeLine("")}}'
			},{
				name: 'right',
				component: 'Layout',
        className: 'app-auxbalancesum-rpt-body-right',
        children:[{
          name: 'accountQuery',
          title: 'accountQuery',
          component: 'SearchCard',
          refName: 'accountQuery',
          didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',	
          clearClick: '{{function(value){$clearValueChange(value)}}}',
          searchClick: '{{function(value, option){$searchValueChange(value, option)}}}',
          onChange: '{{function(value){$searchValueChange(value)}}}',
          queryAccountSubjects: '{{function(){$queryAccountSubjects()}}}',
          refreshBtn: {
            name: 'refreshBtn',
            component: 'Icon',
            fontFamily: 'edficon',
            type: 'shuaxin',
            className: 'app-auxbalancesum-rpt-reload',
            onClick: '{{$refreshBtnClick}}',
            title:'刷新'
          },
          confirmBtn: {
            hidden: false,
            text: '查询'
          },
          cancelBtn: {
            hidden: false,
            text: '取消'
          },
          clearBtn: {
            hidden: false,
            text: '重置'
          },
          menuBtn: [{
            component: 'Checkbox',
            children: '显示小计',
            className: 'app-auxbalancesum-rpt-normalSearch-cb',
            checked: '{{data.showOption.includeSum}}',
            onChange: '{{function(e){$showOptionsChange("includeSum", e.target.checked)}}}'
          }, {
            component: 'Button',
            className: 'btn',
            style: {marginLeft:0},
            onClick: '{{function(e){$searchTypeRptChange("searchTypeTitle", data.showOption.searchTypeTitle)}}}',
            children: '{{data.showOption.searchTypeTitle}}'
          }, {
            name: 'common',
            component: 'Dropdown',
            overlay: {
              name: 'menu',
              component: 'Menu',
              onClick: '{{$shareClick}}',
              children: [{
                name: 'weixinShare',
                component: 'Menu.Item',
                key: 'weixinShare',
                children: '微信/QQ'
              }, {
                name: 'mailShare',
                component: 'Menu.Item',
                key: 'mailShare',
                children: '邮件分享'
              }]
            },
            children: {
              name: 'internal',
              component: 'Button',
              type: 'primary',
              children: ['分享', {
                name: 'down',
                component: 'Icon',
                type: 'down'
              }]
            }
          },
          // {
          //   name: 'batch2',
          //   component: 'Dropdown.AntButton',
          //   onClick: '{{$print}}',
          //   className: 'dropdownbutton2',
          //   style: { marginLeft: '8px' },
          //   overlay: {
          //     name: 'menu',
          //     component: 'Menu',
          //     onClick: '{{$moreActionOpeate}}',
          //     children: [
          //       {
          //         name: 'subjectManage',
          //         component: 'Menu.Item',
          //         key: 'subjectManage',
          //         children: '打印设置'
          //       }
    
    
          //     ]
          //   },
          //   children: [{
          //     name: 'save',
          //     component: 'Icon',
          //     fontFamily: 'edficon',
          //     className: 'app-auxbalancesum-rpt-dayin',
          //     type: 'dayin',
          //     title: '打印',
    
          //   }]
          // },
          {
            name: 'save',
            component: 'Icon',
            fontFamily: 'edficon',
            className: 'dayin',
            type: 'dayin',
            onClick: '{{$print}}',
            title: '打印'
          },
           {
            name: 'share',
            component: 'Icon',
            fontFamily: 'edficon',
            className: 'daochu',
            type: 'daochu',
            title: '导出',
            onClick: '{{$export}}'
          }],
          moreSearch: '{{data.searchValue}}',
          moreSearchItem: '{{$renderAuxSearchItem()}}',
          normalSearchValue: `{{$getNormalSearchValue()}}`,
          normalSearch: [{
            name: 'date',
            type: 'DateRangeMonthPicker',
            format: "YYYY-MM",
            allowClear: false,
            startEnableDate: '{{data.other.enabledDate}}',
            popupStyle: { zIndex: 10 },
            mode: ['month', 'month'],
            onChange: '{{$onPanelChange}}',
            value: '{{$getNormalDateValue()}}'
    
          }],
          normalSearcChildren: [{
            name: 'selectContianer',
            component: '::div',
            className: 'app-auxbalancesum-rpt-normalSearch',
            style: '{{$sigleAccountIsShow()}}',
            children: [{
              name: 'leftBtn',
              component: 'Icon',
              style: '{{$sigleAccountIsShow()}}',
              fontFamily: 'edficon',
              type: 'zuo',
              className: 'app-auxbalancesum-rpt-normalSearch-leftBtn',
              onClick: '{{function(){$accountlistBtn("left")}}}'
            }, {
              name: 'select',
              component: 'Select',
              className: 'app-auxbalancesum-rpt-normalSearch-input',
                style: '{{$sigleAccountIsShow()}}',
              onChange: '{{function(value){$accountlistChange(value, false)}}}',
              filterOption: '{{$filterSingleAccountOption}}',
              value: '{{data.other.sigleAccountCode}}',
              children: {
                name: 'sigleAccountCode',
                component: 'Select.Option',
                className: 'app-auxbalancesum-rpt-account-select-item',
                value: '{{ data.other.sigleAccountList && data.other.sigleAccountList[_lastIndex].code }}',
                children: '{{data.other.sigleAccountList && data.other.sigleAccountList[_lastIndex].codeAndName }}',
                title: '{{data.other.sigleAccountList && data.other.sigleAccountList[_lastIndex].codeAndName }}',
                _power: 'for in data.other.sigleAccountList'
              }
            }, {
              name: 'rightBtn',
              component: 'Icon',
              fontFamily: 'edficon',
              type: 'you',
              style: '{{$sigleAccountIsShow()}}',
              className: 'app-auxbalancesum-rpt-normalSearch-rightBtn',
              onClick: '{{function(){$accountlistBtn("right")}}}'
            }]
          },{
            name: 'selectContianer',
            component: '::div',
            className: 'app-auxbalancesum-rpt-normalSearch',
            children: '{{$renderActiveSearch()}}'
          }]
    
        }, {
          name: 'voucherItems',
          component: 'Table',
          pagination: false,
          className: 'app-auxbalancesum-rpt-table-tbody',
          scroll: '{{data.list.length > 0 ? data.tableOption : {}}}',
          loading: '{{data.loading}}',
          allowColResize: false,
          enableSequenceColumn: false,
          bordered: true,
          dataSource: '{{data.list}}',
          noDelCheckbox: true,
          columns: '{{$tableColumns()}}'
        }]
      }]
    }]
  }
}

export function childVoucherItems() {
  return {
    name: 'childVoucherItems',
    component: 'Table',
    dataSource: '{{data.dataItems}}',
    className: 'app-proof-of-list-child-Body',
    columns: [{
      title: '摘要1',
      name: 'summary1',
      dataIndex: 'summary1',
      key: 'summary1'
    }, {
      title: '科目1',
      name: 'accountingSubject1',
      dataIndex: 'accountingSubject1',
      key: 'accountingSubject1'
    }, {
      title: '借方金额1',
      name: 'debitAmount1',
      dataIndex: 'debitAmount1',
      key: 'debitAmount1',
      render: '{{data.content}}'
    }, {
      title: '贷方金额1',
      name: 'creditAmount1',
      key: 'creditAmount1',
      dataIndex: 'creditAmount1',
      render: '{{data.content}}'
    }]
  }
}

export function getInitState(option) {
  return {
    data: {
      tableOption: {
        x: 1400,
        y: null
      },
      sort: {
        userOrderField: null,
        order: null
      },
      showOption: {
        isIncludeAllTotal: true,
        includeSum: false,
        searchTypeTitle: '科目辅助余额表', //默认按钮显示科目辅助余额表，但是当前界面是辅助余额表
        searchType: 0
      },
      list: [],
      content: '查询条件：',
      searchValue: {
        accountCodeList: [],
        beginAccountGrade: '1',
        endAccountGrade: '5',
        showZero: ['1'],
        printType: 4,//辅助科目余额表
        date_end: option.date_end,
        date_start: option.date_start
      },
      style: '',
      pagination: {
        currentPage: 1,
        totalCount: 0,
        pageSize: 50,
        totalPage: 0
      },
      assistForm: {
        assistFormSelectValue: ['customerId'],
        initOption: [],
        assistFormOption: []
      },
      other: {
        accountSimpleStyle: false,
        sigleAccountCode: '0000',
        sigleAccountList: [],
        accountList: [],
        endAccountDepthList: [],
        startAccountDepthList: [],
        enabledDate: '',
        changeSipmleDate:false,
        currentTime: '',
        timePeriod: {}
      },
			loading: true
    }
  }
}
