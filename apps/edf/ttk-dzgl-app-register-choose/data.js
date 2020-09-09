import moment from "moment";

export function getMeta() {
  return {
    name: "root",
    component: "Layout",
    className: "ttk-dzgl-app-register-choose",
    children: [
      {
        name: "header",
        className: "ttk-dzgl-app-register-choose-header",
        component: "Layout",
        children: [
          {
            name: "header-left",
            component: "Layout",
            className: "ttk-dzgl-app-register-choose-header-left",
            children: [
              {
                name: "logo",
                component: "::img",
                className: "ttk-dzgl-app-register-choose-header-left-logo",
                src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login_jc.png'}}"
              },
              {
                name: "split",
                component: "::div",
                className: "ttk-dzgl-app-register-choose-header-left-split"
              },
              {
                name: "item",
                className: "ttk-dzgl-app-register-choose-header-left-login",
                component: "::span",
                children: "注册新机构"
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
          //   className: "ttk-dzgl-app-register-choose-header-right",
          //   component: "::a",
          //   onClick: "{{$goLogin}}",
          //   children: ["登录"]
          // }
        ]
      },
      {
        name: "formContainer",
        component: "::div",
        className: "ttk-dzgl-app-register-choose-form-container",
        children: {
          name: "form",
          component: "Form",
          className: "ttk-dzgl-app-register-choose-form",
          children: [
            {
              name: "title",
              component: "::div",
              className: "ttk-dzgl-app-register-choose-form-title",
              children: "注册新机构"
            },
              {
              name: "radio",
              component: "Radio.Group",
              value: '{{data.other.choose}}',
              onChange: '{{$radioChange}}',
              children: [
                  {
                      name: "radio1",
                      component: "Radio",
                      value: 1,
                      children: [{
                          name:'title',
                          component: '::span',
                          children: '我已有金财代账账号，请先登录'
                      }, {
                          name: "name",
                          component: "Form.Item",
                          className: "ttk-dzgl-app-register-choose-form-name",
                          children: [{
                              name: 'item2',
                              component: 'Form.Item',
                              validateStatus: "{{data.other.error.mobile?'error':'success'}}",
                              help: '{{data.other.error.mobile}}',
                              className: 'ttk-dzgl-app-register-choose-form-name-mobile',
                              children: [{
                                name: 'mobile',
                                component: 'Input',
                                autoFocus: 'autoFocus',
                                placeholder: '请输入您的账号',
                                onFocus: "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
                                onChange: "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
                                onBlur: "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'login')}}}",
                                value: '{{data.form.mobile}}',
                                prefix: {
                                  name: 'userIcon',
                                  component: 'Icon',
                                  fontFamily: 'edficon',
                                  type: 'XDZyonghuming',
                                }
                              }]
                            }, {
                              name: 'item3',
                              component: 'Form.Item',
                              validateStatus: "{{data.other.error.password?'error':'success'}}",
                              help: '{{data.other.error.password}}',
                              className: 'ttk-dzgl-app-register-choose-form-name-password',
                              children: [{
                                name: 'password',
                                component: 'Input',
                                placeholder: '请输入您的密码',
                                type: 'password',
                                onFocus: "{{function(e){$setField('data.other.error.password', undefined)}}}",
                                onChange: `{{function(e){$setField('data.other.error.password', undefined);$setField('data.other.userInput', true);$setField('data.form.password', e.target.value)}}}`,
                                onBlur: `{{function(e){$fieldChange('data.form.password', e.target.value)}}}`,
                                value: '{{data.form.password}}',
                                prefix: {
                                  name: 'passwordIcon',
                                  component: 'Icon',
                                  fontFamily: 'edficon',
                                  type: 'XDZmima',
                                },
                              }]
                            },
                              // {
                              //     name: "mobile",
                              //     component: "Input",
                              //     size: "large",
                              //     autoFocus: true,
                              //     value: "{{data.form.mobile}}",
                              //     placeholder: "请输入您的账号",
                              //     onFocus: "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
                              //     onChange: "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
                              //     // onBlur: "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'next')}}}",
                              //     prefix: {
                              //         name: "prefix",
                              //         component: "::span",
                              //         children: [
                              //             {
                              //                 name: "require",
                              //                 component: "::span",
                              //                 className: "ant-form-item-required"
                              //             }
                              //         ]
                              //     }
                              // },
                          ]
                      }, 
                      // {
                      //         name: "password",
                      //         component: "Form.Item",
                      //         // className: "ttk-dzgl-app-register-choose-form-password",
                      //         validateStatus: "{{data.other.error.password?'error':'success'}}",
                      //         help: "{{data.other.error.password}}",
                      //         children: [
                      //             {
                      //                 name: "password",
                      //                 component: "Input",
                      //                 size: "large",
                      //                 type: "password",
                      //                 value: "{{data.form.password}}",
                      //                 placeholder: "请输入密码（6—20位，至少包含一个字母和一个数字）",
                      //                 onFocus: "{{function(e){$setField('data.other.error.password', undefined)}}}",
                      //                 onChange: "{{function(e){$fieldChange('data.form.password', e.target.value)}}}",
                      //                 onBlur: "{{function(e){$fieldChange('data.form.password', e.target.value, 'next')}}}",
                      //                 prefix: {
                      //                     name: "prefix",
                      //                     component: "::span",
                      //                     children: [
                      //                         {
                      //                             name: "require",
                      //                             component: "::span",
                      //                             className: "ant-form-item-required"
                      //                         }
                      //                     ]
                      //                 }
                      //             }
                      //         ]
                      //     }
                        ],
                  },{
                      name: "radio1",
                      component: "Radio",
                      value: 2,
                      children: '我还没有金财代账账号，请先注册账号'
                  },
              ]
            }
              //,{
              //     name: "name",
              //     component: "Form.Item",
              //     className: "ttk-dzgl-app-register-choose-form-name",
              //     validateStatus: "{{data.other.error.mobile?'error':'success'}}",
              //     help: "{{data.other.error.mobile}}",
              //     children: [
              //         {
              //             name: "mobile",
              //             component: "Input",
              //             size: "large",
              //             autoFocus: true,
              //             value: "{{data.form.mobile}}",
              //             placeholder: "请输入您的账号",
              //             onFocus: "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
              //             onChange: "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
              //             // onBlur: "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'next')}}}",
              //             prefix: {
              //                 name: "prefix",
              //                 component: "::span",
              //                 children: [
              //                     {
              //                         name: "require",
              //                         component: "::span",
              //                         className: "ant-form-item-required"
              //                     }
              //                 ]
              //             }
              //         },
              //     ]
              // }, {
              //     name: "password",
              //     component: "Form.Item",
              //     // className: "ttk-dzgl-app-register-choose-form-password",
              //     validateStatus: "{{data.other.error.password?'error':'success'}}",
              //     help: "{{data.other.error.password}}",
              //     children: [
              //         {
              //             name: "password",
              //             component: "Input",
              //             size: "large",
              //             type: "password",
              //             value: "{{data.form.password}}",
              //             placeholder: "请输入密码（6—20位，至少包含一个字母和一个数字）",
              //             onFocus: "{{function(e){$setField('data.other.error.password', undefined)}}}",
              //             onChange: "{{function(e){$fieldChange('data.form.password', e.target.value)}}}",
              //             onBlur: "{{function(e){$fieldChange('data.form.password', e.target.value, 'next')}}}",
              //             prefix: {
              //                 name: "prefix",
              //                 component: "::span",
              //                 children: [
              //                     {
              //                         name: "require",
              //                         component: "::span",
              //                         className: "ant-form-item-required"
              //                     }
              //                 ]
              //             }
              //         }
              //     ]
              // }
            //   , {
            //   name: "submit",
            //   component: "Button",
            //   className: "ttk-dzgl-app-register-choose-form-submit",
            //   onClick: "{{$submitClick}}",
            //   disabled: '{{data.form.agree == false}}',
            //   type: "primary",
            //   children: "{{data.other.choose == 1 ? '登录' : '下一步' }}"
            // }
            ,{
                  name: "form-button",
                  component: "::div",
                  className: "ttk-dzgl-app-register-choose-form-footerButton",
                  children: [
                      {
                          name: "submit",
                          component: "Button",
                          className: "ttk-dzgl-app-register-choose-form-submit",
                          onClick: "{{$submitClick}}",
                          disabled: '{{data.form.agree == false}}',
                          type: "primary",
                          children: "{{data.other.choose == 1 ? '登录' : '下一步' }}"
                      },{
                          name: "back",
                          component: "Button",
                          className: "ttk-dzgl-app-register-choose-form-submit",
                          onClick: "{{$goLogin}}",
                          type: "primary",
                          children: "取消"
                      },
                  ]
              },{
                  name: "form-reLogin",
                  component: "::div",
                  className: "ttk-dzgl-app-register-form-footerButton",
                  children: [
                      {
                          name: "content",
                          component: "::a",
                          style: { marginBottom: '15px'},
                          href: "javascript:;",
                          onClick: "{{$goRegister}}",
                          children: "没有账号，请注册"
                      }
                  ]
              }

          ]
        }
      },
      {
        name: "footer",
        className: "ttk-dzgl-app-register-choose-footer",
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
        className: "ttk-dzgl-app-register-choose-footer-mobile",
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
          account: '',
          password: '',
          mobile: '',
          agree: true
      },
      time: "获取验证码",
      timeStaus: true,
      other: {
        error: {},
        choose: 1
      }
    }
  };
  return state;
}
