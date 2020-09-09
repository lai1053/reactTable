import * as city from '../../../component/components/address/city'

export function getMeta() {
  return {
    name: "root",
    component: "Layout",
    className: "ttk-dzgl-app-register-organization",
    children: [
      {
        name: "header",
        className: "ttk-dzgl-app-register-organization-header",
        component: "Layout",
        children: [
          {
            name: "header-left",
            component: "Layout",
            className: "ttk-dzgl-app-register-organization-header-left",
            children: [
              {
                name: "logo",
                component: "::img",
                className: "ttk-dzgl-app-register-organization-header-left-logo",
                src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login_jc.png'}}"
              },
              {
                name: "split",
                component: "::div",
                className: "ttk-dzgl-app-register-organization-header-left-split"
              },
               {
                name: 'item',
                className: 'ttk-dzgl-app-login-header-left-login',
                component: '::span',
                children: '企业登录'
              }, {
                name: 'gzlogo',
                component: '::img',
                className: 'ttk-dzgl-app-login-header-left-logo',
                onClick:'{{$goLanding}}',
                src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login.png'}}"
              }]
          },
          // {
          //   name: "header-right",
          //   className: "ttk-dzgl-app-register-organization-header-right",
          //   component: "::a",
          //   onClick: "{{$goLogin}}",
          //   children: ["登录"]
          // }
        ]
      },
      {
        name: "formContainer",
        component: "::div",
        className: "ttk-dzgl-app-register-organization-form-container",
        children: {
          name: "form",
          component: "Form",
          className: "ttk-dzgl-app-register-organization-form",
          children: [
            {
              name: "title",
              component: "::div",
              className: "ttk-dzgl-app-register-organization-form-title",
              children: "注册新机构"
            },
              // {
              //     name: "form-footer",
              //     component: "::div",
              //     className: "ttk-dzgl-app-register-organization-form-footer",
              //     children: [
              //         {
              //             name: "rule",
              //             component: "::div",
              //             className: "ttk-dzgl-app-register-organization-form-footer-rule",
              //             children: [
              //                 {
              //                     name: "checkbox",
              //                     component: "Checkbox",
              //                     checked: "{{data.form.loginStatus}}",
              //                     // onChange:
              //                     //     '{{function(e){$sf("data.form.loginStatus", e.target.checked)}}}',
              //                     children: "账号登陆成功"
              //                 }
              //             ]
              //         }
              //     ]
              // },
            {
              name: "componyNameForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-organization-form-name",
              validateStatus: "{{data.other.error.componyName?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.componyName}}",
              children: [
                {
                  name: "componyName",
                  component: "Input",
                  size: "large",
                  // autoFocus: true,
                  value: "{{data.form.componyName}}",
                  placeholder: "请输入机构名称",
                  onFocus:
                    "{{function(e){$setField('data.other.error.componyName', undefined)}}}",
                  onChange:
                    "{{function(e){$fieldChange('data.form.componyName', e.target.value)}}}",
                  onBlur:
                    "{{function(e){$fieldChange('data.form.componyName', e.target.value, 'next')}}}",
                  prefix: {
                    name: "prefix",
                    component: "::span",
                    children: [
                      {
                        name: "require",
                        component: "::span",
                        className: "ant-form-item-required"
                      }
                    ]
                  }
                }
              ]
            },
            {
              name: "componyAddressForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-organization-form-mail",
              validateStatus: "{{data.other.error.componyAddress?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.componyAddress}}",
              children: [{
                  name: "componyNameRemind",
                  component: "::p",
                  style: {margin: '12px 0 0',color: '#f5222d'},
                  children:'*一个机构请申请一次，其他会计系统内自加！'
              },{
                name: 'detail',
                component: 'Address',
                value: {disabled: false},
                showDetail: false,
                width: 123,
                height: 50,
                provinces: '{{data.form.registeredProvincial}}',
                citys: '{{data.form.registeredCity}}',
                districts: '{{data.form.registeredCounty}}',
                text: '{{data.form.registeredAddress}}',
                onChange: "{{function(e) {$setAddress(e)}}}",
                getPopupContainer:".ttk-dzgl-app-register-organization-form-container",
                isRequired: true
              }
                // {
                //   name: "componyAddress",
                //   component: "Cascader",
                //   expandTrigger: 'hover',
                //   className: "ttk-dzgl-app-register-organization-form-mail",
                //   // size: "large",
                //     allowClear: false,
                //   value: '{{data.form.componyAddress}}',
                //   options: '{{data.other.ssInfo}}',
                //   placeholder: "请选择所属区域",
                //   onFocus:
                //     "{{function(e){$sf('data.other.error.componyAddress', undefined)}}}",
                //   onChange:
                //     "{{function(e){$sf('data.form.componyAddress', e)}}}",
                //   // onBlur:
                //   //   "{{function(e){$fieldChange('data.form.componyAddress', e, 'next')}}}",
                //   prefix: {
                //     name: "prefix",
                //     component: "::span",
                //     children: [
                //       {
                //         name: "require",
                //         component: "::span",
                //         className: "ant-form-item-required"
                //       }
                //     ]
                //   }
                // }
              ]
            },
            {
              name: "componyAddressInfoForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-organization-form-componyname",
              validateStatus:
                "{{data.other.error.componyAddressInfoForm?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.componyAddressInfoForm}}",
              children: [
                {
                  name: "componyAddressInfo",
                  component: "Input",
                  size: "large",
                  value: "{{data.form.componyAddressInfoForm}}",
                  placeholder: "请输入机构的详细地址",
                  onFocus:
                    "{{function(e){$setField('data.other.error.componyAddressInfoForm', undefined)}}}",
                  onChange:
                    "{{function(e){$fieldChange('data.form.componyAddressInfoForm', e.target.value)}}}",
                  onBlur:
                    "{{function(e){$fieldChange('data.form.componyAddressInfoForm', e.target.value, 'next')}}}",
                  prefix: {
                    name: "prefix",
                    component: "::span",
                    children: [
                      {
                        name: "require",
                        component: "::span",
                        className: "ant-form-item-required"
                      }
                    ]
                  }
                }
              ]
            },
              {
                  name: "nameForm",
                  component: "Form.Item",
                  className: "ttk-dzgl-app-register-organization-form-componyname",
                  validateStatus: "{{data.other.error.name?'error':'success'}}",
                  // _visible: "{{data.other.step==1}}",
                  help: "{{data.other.error.name}}",
                  children: [
                      {
                          name: "name",
                          component: "Input",
                          size: "large",
                          // autoFocus: true,
                          value: "{{data.form.name}}",
                          placeholder: "请输入联系人名称",
                          onFocus:
                              "{{function(e){$setField('data.other.error.name', undefined)}}}",
                          onChange:
                              "{{function(e){$fieldChange('data.form.name', e.target.value)}}}",
                          onBlur:
                              "{{function(e){$fieldChange('data.form.name', e.target.value, 'next')}}}",
                          prefix: {
                              name: "prefix",
                              component: "::span",
                              children: [
                                  {
                                      name: "require",
                                      component: "::span",
                                      className: "ant-form-item-required"
                                  }
                              ]
                          }
                      }
                  ]
              },
              {
              name: "mobileForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-organization-form-mobile",
              validateStatus: "{{data.other.error.mobile?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.mobile}}",
              children: [
                {
                  name: "mobile",
                  component: "Input",
                  size: "large",
                  value: "{{data.form.mobile}}",
                  placeholder: "请输入联系电话",
                  onFocus:
                    "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
                  onChange:
                    "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
                  onBlur:
                    "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'next')}}}",
                  prefix: {
                    name: "prefix",
                    component: "::span",
                    children: [
                      {
                        name: "require",
                        component: "::span",
                        className: "ant-form-item-required"
                      }
                    ]
                  }
                }
              ]
            },
            {
              name: "form-footer",
              component: "::div",
              className: "ttk-dzgl-app-register-organization-form-footer",
                style: {marginTop: '25px'},
              children: [
                {
                  name: "rule",
                  component: "::div",
                  className: "ttk-dzgl-app-register-organization-form-footer-rule",
                  children: [
                    {
                      name: "checkbox",
                      component: "Checkbox",
                      checked: "{{data.form.agree}}",
                      onChange:
                        '{{function(e){$sf("data.form.agree", e.target.checked)}}}',
                      children: "同意"
                    },
                    {
                      name: "content",
                      component: "::a",
                      href: "javascript:;",
                      onClick: "{{$openRuleContent}}",
                      children: "《用户协议条款》"
                    }
                  ]
                }
              ]
            },
              {
                  name: "submit",
                  component: "Button",
                  className: "ttk-dzgl-app-register-organization-form-submit",
                  onClick: "{{$submitClick}}",
                  disabled: '{{data.form.agree == false}}',
                  type: "primary",
                  children: "提交"
              }
          ]
        }
      },
      {
        name: "footer",
        className: "ttk-dzgl-app-register-organization-footer",
        component: "Layout",
        children: [{
          name: 'item1',
          component: '::p',
          children: [{
            name: 'item1',
            component: '::span',
            children: '{{appBasicInfo.name}}'
          }, {
            name: 'version',
            id: 'lbl-version',
            component: '::span',
            children: '{{data.other.version}}'
          }, {
            name: 'item2',
            component: '::span',
            children: '{{" 版权所有 © 2018 " + appBasicInfo.companyName +" "}}'
          }, {
            name: 'item3',
            component: '::span',
            children: '{{appBasicInfo.copyright1}}'
          }, {
            name: "item4",
            component: "::a",
            target: "_blank",
            style: { color: "#a1a1a1" },
            href: '{{appBasicInfo.beianDomain}}',
            children: '{{appBasicInfo.copyright2}}'
          }, {
            name: 'item5',
            component: '::span',
            children: '{{appBasicInfo.copyright3}}'
          }]
        }]
      },
      {
        name: "footer",
        className: "ttk-dzgl-app-register-organization-footer-mobile",
        component: "Layout",
        children: [
          {
            name: "item1",
            component: "::p",
            children: [
              {
                name: "item1",
                component: "::span",
                children: '{{"版权所有 © 2019 " + appBasicInfo.companyNameShort}}'
              }
            ]
          }
        ]
      }
    ]
  };
}
export function getInitState(option) {
  let state = {
    data: {
      form: {
        loginStatus: true,
        name: "",
        mail: "",
        componyName: "",
        componyAddress: [],
        componyAddressInfoForm: "",
        mobile: "",
        select: 1,
        captcha: "",
        password: "",
        sign: null,
        agree: true
      },
      time: "获取验证码",
      timeStaus: true,
      other: {
        sysOrg: {},
        step: 1,
        error: {},
        editDate: false,
        editStandard: false,
        selectOption: [],
      }
    }
  };
  return state;
}
