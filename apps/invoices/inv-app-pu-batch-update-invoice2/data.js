export function getMeta() {
  return {
    name: 'root',
    component: 'Layout',
    className: 'inv-app-pu-batch-update-invoice',
    children: [
      {
        name: 'spin',
        component: 'Spin',
        tip: '加载中',
        spinning: '{{data.loading}}',
        delay: 0.01,
        children: [
          {
            name: 'demo',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            children: [
              {
                name: 'span1',
                component: '::span',
                style: {
                  fontSize: '12px',
                  display: 'inline-block',
                  lineHeight: '21px',
                  height: '42px',
                  margin: 0,
                  color: '#f27215',
                  float: 'left'
                },
                children: '提示：'
              },
              {
                name: 'span2',
                component: '::span',
                style: {
                  display: 'inline-block',
                  float: 'left',
                  width: '325px',
                  fontSize: '12px'
                },
                children:
                  '未认证、已认证-待抵扣发票可在以后任意属期修改，其他发票请回到对应属期修改。'
              }
            ]
          },
          {
            name: 'status1',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            className: 'has-divider',
            children: {
              name: 'lable',
              component: 'Checkbox',
              disabled: '{{data.other.uniformOrAricultural}}',
              onChange:
                '{{function(e){$handleFieldChangeC("data.enableBdzt",e)}}}',
              checked: '{{data.enableBdzt}}',
              children: '认证状态'
            }
          },
          {
            name: 'status2',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            className: 'inv-app-pu-batch-update-invoice-div',
            children: {
              name: 'radiogroup',
              component: 'Radio.Group',
              onChange:
                '{{function(e){$handleFieldChangeE("data.form.bdzt",e)}}}',
              value: '{{data.form.bdzt}}',
              children: [
                {
                  name: 'radio1',
                  component: 'Radio',
                  value: '1',
                  disabled:
                    '{{!data.enableBdzt||data.other.uniformOrAricultural}}',
                  children: '已认证'
                },
                {
                  name: 'radio2',
                  value: '0',
                  component: 'Radio',
                  disabled:
                    '{{!data.enableBdzt||data.other.uniformOrAricultural}}',
                  children: '未认证'
                }
              ]
            }
          },
          {
            name: 'dikou',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            className: 'has-divider',
            children: {
              name: 'lable',
              component: 'Checkbox',
              disabled: '{{data.other.isShenBaoYongTu}}',
              checked: '{{data.shenBaoYongTu}}',
              onChange:
                '{{function(e){$handleFieldChangeCC("data.shenBaoYongTu",e)}}}',
              children: '申报用途'
            }
          },
          {
            name: 'status3',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            className: 'inv-app-pu-batch-update-invoice-div',
            children: {
              name: 'radiogroup',
              component: 'Radio.Group',
              onChange:
                '{{function(e){$handleFieldChangeEE("data.form.dkzt",e)}}}',
              value: '{{data.form.dkzt}}',
              children: [
                {
                  name: 'radio1',
                  component: 'Radio',
                  value: '1',
                  disabled:
                    '{{!data.shenBaoYongTu||data.other.isShenBaoYongTu}}',
                  children: '抵扣'
                },
                {
                  name: 'radio2',
                  component: 'Radio',
                  value: '10',
                  disabled:
                      '{{!data.shenBaoYongTu||data.other.isShenBaoYongTu}}',
                  children: '待抵扣'
                },
                {
                  name: 'radio3',
                  value: '2',
                  component: 'Radio',
                  disabled:
                    '{{!data.shenBaoYongTu||data.other.isShenBaoYongTu}}',
                  children: '退税'
                },
                {
                  name: 'radio4',
                  value: '3',
                  component: 'Radio',
                  disabled:
                    '{{!data.shenBaoYongTu||data.other.isShenBaoYongTu}}',
                  children: '代办退税'
                },
                {
                  name: 'radio5',
                  value: '6',
                  component: 'Radio',
                  disabled:
                    '{{!data.shenBaoYongTu||data.other.isShenBaoYongTu}}',
                  children: '不抵扣'
                }
              ]
            }
          },
          {
            name: 'dikou',
            component: '::div',
            _visible:'{{data.swVatTaxpayer === "0"}}',
            className: 'inv-app-pu-batch-update-invoice-div',
            children: [
              {
                name: 'label',
                component: '::span',
                children: '抵扣月份：'
              },
              {
                name: 'status',
                component: 'Select',
                placeholder: '',
                value: '{{data.form.dkyf}}',
                disabled: '{{data.enableDkyf ||(data.form.dkzt !== "1") }}',
                onChange:
                  '{{function(date,dateString){$handleFieldChangeV("data.form.dkyf",date)}}}',
                children: '{{$renderDkyf()}}'
              }
            ]
          },
          {
            name: 'row1',
            component: '::div',
            className: 'has-divider',
            children: {
              name: 'checkbox',
              component: 'Checkbox',
              className: 'cbx',
              children: '即征即退标识',
              checked: '{{data.immediateWithdrawal}}',
              onChange: "{{function(e){$handerImmediateWithdrawalOrCargoType(e.target.checked,1)}}}",
            }
          },
          {
            name: 'row2',
            component: '::div',
            className: 'inv-app-pu-batch-update-invoice-div',
            children: [{
              name: 'type-action',
              component: 'Radio.Group',
              className: 'radio-group',
              value: '{{data.immediateWithdrawal?data.immediateWithdrawalRadio:null}}',
              disabled: '{{!data.immediateWithdrawal}}',
              onChange: "{{function(e){$sf('data.immediateWithdrawalRadio',e.target.value)}}}",
              children: [{
                name: 'item1',
                component: 'Radio',
                value: 'Y',
                children: '是',
                className: 'radio'
              }, {
                name: 'item2',
                component: 'Radio',
                value: 'N',
                children: '否',
                className: 'radio'
              }]
            }]
          },
        ]
      }
    ]
  }
}

export function getInitState() {
  return {
    data: {
      loading: true,
      enableBdzt: false,
      enableDkyf: false,
      shenBaoYongTu: false,
      form: {},
      other: {
        isTutorialPeriod: '',
        uniformOrAricultural: false,
        isShenBaoYongTu: true,
        vato: false
      }
    }
  }
}
