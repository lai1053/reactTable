export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'inv-app-sales-collect-card-is',
    children: [{
      name: 'mail',
      component: 'Spin',
      tip: '{{data.other && data.other.tip || "loading"}}',
      spinning: '{{data.loading}}',
      delay: 0.01,
      children: [{
        name: 'date-container',
        component: '::div',
        className: 'container',
        children: [{
          name: 'lable',
          component: '::span',
          className: 'lable',
          children: '发票月份：',
        }, {
          name: 'bill-month',
          component: 'DatePicker.MonthPicker',
          style:{ width: '100px'},
          format: "YYYY-MM",
          allowClear: true,
          //className: "month",
          value: "{{$stringToMoment((data.bill_date),'YYYY-MM')}}",
          onChange: "{{function(e){$loadInvoiceTimeChange(e)}}}",
          // disabledDate: '{{$disabledRangePicker}}'
        },{
          name:'bill-a',
          component:'::span',
          children:'-'
        },{
          name: 'bill-month2',
          component: 'DatePicker.MonthPicker',
          style:{ width: '100px'},
          format: "YYYY-MM",
          allowClear: true,
          //className: "month",
          value: "{{$stringToMoment((data.bill_date2),'YYYY-MM')}}",
          onChange: "{{function(e){$loadInvoiceTimeChange2(e)}}}",
          disabledDate: '{{$disabledDate}}'
        }
        
        ]
      }, {
        name: 'tips-container',
        component: '::div',
        className: 'container',
        children: [{
          name: 'lable',
          component: '::span',
          className: 'lable warning',
          children: '温馨提示：',
        }, {
          name: 'tip',
          component: '::span',
          className: 'tip',
          children: '{{data.nsqxTips}}',
          // children: '{{$renderTips()}}',
        }]
      }]
    }, {
      name: 'footer',
      component: '::div',
      className: 'footer',
      _visible: false,
      children: [{
        name: 'btn',
        component: 'Button',
        // type: 'primary',
        children: '取消'
      }, {
        name: 'btn',
        component: 'Button',
        type: 'primary',
        children: '确认',
        loading: '{{data.loading}}',
        onClick: '{{$handelSubmit}}'
      }]
    }]
  }
}

export function getInitState() {
  return {
    data: {
      loading: false,
      bill_date: '2019-04',
      bill_date2:'',
      nsqxdm: '06',
      nsqxUnit: '月',
      nsqxTips: '',
      other: {
        tip: '正在采集销项发票，请稍后…',
      }
    }
  }
}