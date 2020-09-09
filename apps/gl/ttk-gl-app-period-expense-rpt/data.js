// import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-period-expense-rpt',
        children: [{
            name: 'head',
            component: '::div',
            className: 'ttk-gl-app-period-expense-rpt-head',
            children: [{
              name: 'header-content',
              component: '::div',
              className: 'ttk-gl-app-period-expense-rpt-headerContent',
              children: {
                  name: 'header',
                  component: '::div',
                  className: 'ttk-gl-app-period-expense-rpt-header',
                  children: [{
                    name: 'header-left',
                    component: '::div',
                    className: 'ttk-gl-app-period-expense-rpt-header-left',
                    children: [{
                      name: 'date',
                      component: 'DatePicker.MonthPicker',
                      format: "YYYY-MM",
                      allowClear: false,
                      className: "mk-rangePicker",
                      onChange: "{{function(d){$sf('data.period',$momentToString(d,'YYYY-MM'),$onDatePickerChange($momentToString(d,'YYYY-MM')))}}}",
                      value: '{{$stringToMoment(data.period)}}',
                      disabledDate: `{{function(current){ var disabledDate = new Date(data.other.disabledDate)
  													return current && (current.valueOf() < disabledDate || current.valueOf() > (new Date(data.other.maxEndYM)))
  					          }}}`
                    }, {
            					name: 'noDisplayOnAccountNoHappen',
            					children: '科目无发生不显示',
            					key: 'noDisplayOnAccountNoHappen',
            					dataIndex: 'noDisplayOnAccountNoHappen',
            					component: 'Checkbox',
            					checked: "{{data.filter.noDisplayOnAccountNoHappen}}",
            					onChange: "{{$onFieldChange(_ctrlPath, data.filter.noDisplayOnAccountNoHappen)}}"
            				}, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'shuaxin',
                        className: 'ttk-gl-app-period-expense-rpt-header-reload',
                        onClick: '{{$load}}',
                    }]
                  }, {
                    name: 'header-right',
                    component: '::div',
                    className: 'ttk-gl-app-period-expense-rpt-header-right',
                    children: [{
              				name: 'common',
              				component: 'Dropdown',
              				// trigger:'click',
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
              				}}, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'dayin',
                        className: 'dayin',
                        onClick: '{{$print}}',
                        title: '打印'
                      }, {
                        component: 'Icon',
                        fontFamily: 'edficon',
                        className: 'daochu',
                        type: 'daochu',
                        title: '导出',
                        onClick: '{{$export}}'
                    }]
                  }]
              }
          }]
        }, {
            // name: 'periodExpenseRpt',
            // component: 'DataGrid',
            // pagination: false,
            // key: '{{Math.random()}}',
            // id: 'periodExpenseRpt',
            // //loading: '{{data.loading}}',
            // className: 'ttk-gl-app-period-expense-rpt-table-tbody',
            // scroll: '{{ { x: data.other.scrollX, y: 480 } }}',
            // allowColResize: false,
            // enableSequenceColumn: false,
            // bordered: true,
            // dataSource: '{{data.list}}',
            // noDelCheckbox: true,
            // columns: '{{$tableColumns()}}'

    				name: 'periodExpenseRpt',
    				component: 'DataGrid',
    				headerHeight: 37,
    				rowHeight: 37,
    				ellipsis: true,
    				rowsCount: "{{data.list.length}}",
    				columns: "{{$drawColumns()}}",
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
                x: 900,
                y: 700
            },
            period: option.periodDate,
            list: [],
            changeSipmleDate: false,
            enableDate: null,
            loading: true,
            filter: {
              noDisplayOnAccountNoHappen: true
            },
            other: {
              disabledDate: option.enabledYearMonth,
              foldStatus: {
                5601: FOLD,
                5602: FOLD,
                5603: FOLD,
                6601: FOLD,
                6602: FOLD,
                6603: FOLD
              },
              iconType: {
                5601: 'xia',
                5602: 'xia',
                5603: 'xia',
                6601: 'xia',
                6602: 'xia',
                6603: 'xia'
              },
              scrollX: 0,
              scrollY: 0
            }
        }
    }
}

export const UNFOLD = 0
export const FOLD = 1
