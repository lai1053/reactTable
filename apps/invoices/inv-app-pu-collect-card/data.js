export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'inv-app-pu-collect-card-is',
    children: [{
      name: 'mail',
      component: 'Spin',
      size: 'small',
      tip: '{{data.other.tip}}',
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
          value: "{{$stringToMoment((data.bill_date),'YYYY-MM')}}",
          onChange: "{{function(e){$loadInvoiceTimeChange(e)}}}",
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
          value: "{{$stringToMoment((data.bill_date2),'YYYY-MM')}}",
          onChange: "{{function(e){$loadInvoiceTimeChange2(e)}}}",
          disabledDate: '{{$disabledDate}}'
        }]
      }, {
        name: 'tips-container',
        component: '::div',
        className: 'container',
        children: [{
          name: 'lable',
          component: '::span',
          className: 'lable warning waring-tips',
          children: '温馨提示：',
        }, 
        {
          name: 'tip2',
          component: '::span',
          // _visible:"{{data.nsrxz === 'YBNSRZZS'}}",
          // className: 'invoice_nsqxTips-tip',
          children: '{{data.invoice_nsqxTips}}',
        }]
      }]
    }, {
      name: 'footer',
      component: '::div',
      className: 'footer',
      _visible: false,
      children: [{
        name: 'btn1',
        component: 'Button',
        type: 'primary',
        children: '确定',
        loading: '{{data.loading}}',
        onClick: '{{$handelSubmit}}'
      }, {
        name: 'btn2',
        component: 'Button',
        children: '取消'
      }]
    }]
  }
}

export function getInitState() {
  return {
    data: {
      loading: false,
      bill_date: '',
      bill_date2:'',
      invoice_nsqxTips: '读取所选月份认证发票和开具发票',
      invoice_nsqxTips2:'读取所选月份开具或票税宝上传的发票。',
      nsrxz:'',
      other: {
        tip: '正在采集进项发票，请稍候…',
      }
    }
  }
}