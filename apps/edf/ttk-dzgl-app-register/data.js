import * as city from '../../../component/components/address/city'
import { Component } from 'react';

import moment from "moment";

export function getMeta() {
  return {
    name: "root",
    component: "Layout",
    className: "ttk-dzgl-app-register",
    children: [
      {
        name: "header",
        className: "ttk-dzgl-app-register-header",
        component: "Layout",
        children: [
          {
            name: "header-left",
            component: "Layout",
            className: "ttk-dzgl-app-register-header-left",
            children: [
              {
                name: "logo",
                component: "::img",
                className: "ttk-dzgl-app-register-header-left-logo",
                src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login_jc.png'}}"
              },
              {
                name: "split",
                component: "::div",
                className: "ttk-dzgl-app-register-header-left-split"
              },
              {
                name: "item",
                className: "ttk-dzgl-app-register-header-left-login",
                component: "::span",
                children: "企业注册"
              }, {
                name: 'gzlogo',
                component: '::img',
                className: 'ttk-dzgl-app-login-header-left-logo',
                src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login.png'}}"
              },]
          },
          // {
          //   name: "header-right",
          //   className: "ttk-dzgl-app-register-header-right",
          //   component: "::a",
          //   onClick: "{{$goLogin}}",
          //   children: ["登录"]
          // }
        ]
      },{
        name: "formContainer",
        component: "::div",
        className: "ttk-dzgl-app-register-form-container",
        children:[ {
          name: 'form',
          component: 'Form',
          className: 'ttk-dzgl-app-register-form',
          children: [{
              name: "title",
              component: "::div",
              className: "ttk-dzgl-app-register-form-title",
              children: "注册"
          },{
            name: 'headerProcess',
            component: '::div',
            className: 'ttk-dzgl-app-register-form-process',
            children:[{
              name: 'oneStep',
              component: '::div',
              style: {position: 'relative'},
              children:[{
                name: 'step1',
                component: '::div',
                className: '{{data.other.step > 1 ? "step step1 lineStep" : "step step1"}}',
                children: [{
                  name: 'step0',
                  component: '::span',
                  _visible: '{{data.other.step == 1}}',
                  style: {marginRight: '8px',},
                  children: '①'
                },{
                  name: 'step00',
                  component: 'Icon',
                  fontFamily: 'edficon',
                  type: 'duigou',
                  _visible: '{{data.other.step > 1}}',
                  style: {marginRight:'8px',fontSize: '20px',fontWeight:'bold',color:'#0066b3'}
                },{
                  name: 'stepText',
                  component: '::span',
                  children: "{{data.form.hasUser?'登录账号':'注册账号'}}"
                }],	
              },{
                name: 'bblock',
                component: '::div',
                children: '',
                className: 'san san1',
              },{
                name: 'wblock',
                component: '::div',
                children: '',
                _visible: '{{data.other.step > 1}}',
                className: 'san san2',
              }]
            },{
              name: 'midStep',
              component: '::div',
              style: {position: 'relative'},
              children:[{
                name: 'wblock',
                component: '::div',
                children: '',
                className: 'san san3',
              },{
                name: 'bblock',
                component: '::div',
                children: '',
                _visible: '{{data.other.step > 2}}',
                className: 'san san4',
              },{
                name: 'step1',
                component: '::div',
                className: '{{data.other.step > 2 ? "step lineStep" :(data.other.step == 2 ? "step active": "step midStep")}}',
                children: [{
                  name: 'step0',
                  component: '::span',
                  _visible: '{{data.other.step <= 2}}',
                  style: {marginRight: '8px'},
                  children: '②'
                },{
                  name: 'step00',
                  component: 'Icon',
                  fontFamily: 'edficon',
                  type: 'duigou',
                  _visible: '{{data.other.step > 2}}',
                  style: {marginRight:'8px',fontSize: '20px',fontWeight:'bold',color:'#0066b3'}
                  }, '注册机构'],	
              },{
                name: 'gblock',
                component: '::div',
                children: '',
                _visible: '{{data.other.step < 2}}',
                className: 'san san5',
              },{
                name: 'bblock',
                component: '::div',
                children: '',
                _visible: '{{data.other.step >= 2}}',
                className: 'san san1',
              },{
                name: 'wblock',
                component: '::div',
                children: '',
                _visible: '{{data.other.step > 2}}',
                className: 'san san2',
              }]
            },{
              name: 'lastStep',
              component: '::div',
              style: {position: 'relative'},
              children:[{
                name: 'wblock',
                component: '::div',
                children: '',
                className: 'san san3',
              },{
                name: 'step1',
                component: '::div',
                className: '{{data.other.step == 3 ? "step lastActive" : "step lastStep"}}',
                children: [{
                  name: 'step0',
                  component: '::span',
                  style: {marginRight: '8px'},
                  children: '③'
                }, '注册成功'],	
              }]
            }]
          },
          {
            name: 'register',
            component: '::div',
            _visible: '{{data.other.step==1}}',
            children: [
              {
                // 注册账号
                name:'isLogin',
                component:'::div',
                _visible: '{{!data.form.hasUser}}',
                children:[{
                    name: "name",
                    component: "Form.Item",
                    className: "ttk-dzgl-app-register-form-name",
                    validateStatus: "{{data.other.error.name?'error':'success'}}",
                    label:"姓名",
                    colon:true,
                    help: "{{data.other.error.name}}",
                    required: true,
                    children: [{
                        name: "name",
                        component: "Input",
                        autoFocus: true,
                        value: "{{data.form.name}}",
                        placeholder: "请输入您的姓名",
                        onFocus:"{{function(e){$setField('data.other.error.name', undefined)}}}",
                        onChange:"{{function(e){$fieldChange('data.form.name', e.target.value)}}}",
                        onBlur:"{{function(e){$fieldChange('data.form.name', e.target.value, 'next')}}}",
                    }]
                },{
                    name: "mobile",
                    component: "Form.Item",
                    className: "ttk-dzgl-app-register-form-mobile",
                    validateStatus: "{{data.other.error.mobile?'error':'success'}}",
                    label:"手机号码",
                    required: true,
                    colon:true,
                    help: "{{data.other.error.mobile}}",
                    children: [ {
                      name: "mobile",
                      component: "Input",
                      value: "{{data.form.mobile}}",
                      placeholder: "请输入您的手机号码",
                      onFocus:"{{function(e){$setField('data.other.error.mobile', undefined)}}}",
                      onChange:"{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
                      onBlur:"{{function(e){$fieldChange('data.form.mobile', e.target.value, 'next')}}}",
                    }
                  ]
                },{
                    name: "captchaItem",
                      component: "Form.Item",
                      className: "ttk-dzgl-app-register-form-captcha",
                      validateStatus: "{{data.other.error.captcha?'error':'success'}}",
                      label:"验证码",
                      required: true,
                      colon:true,
                      help: "{{data.other.error.captcha}}",
                      children: [ {
                              name: "captcha",
                              component: "Input",
                              value: "{{data.form.captcha}}",
                              placeholder: "请输入您收到的验证码",
                              className: "captchaInput",
                              type: "captcha",
                              onFocus: `{{function(e){$fieldChange('data.form.captcha',e.target.value)}}}`,
                              onChange: "{{function(e){$setField('data.form.captcha',e.target.value)}}}",
                              onBlur:"{{function(e){$fieldChange('data.form.captcha',e.target.value, 'next')}}}",
                              addonAfter: {
                                  name: "suffix",
                                  component: "Button",
                                  tabIndex: 3,
                                  style: {
                                      fontSize: "14px",
                                      color: "#999999",
                                      width: "88px"
                                      
                                  },
                                  disabled:
                                      "{{!data.form.mobile || !!data.other.error.mobile || !data.timeStaus }}",
                                  onClick: "{{$getCaptcha}}",
                                  children: "{{data.time}}"
                              }
                          }
                      ]
                },{
                      name: "mail",
                      component: "Form.Item",
                      className: "ttk-dzgl-app-register-form-mail",
                      validateStatus: "{{data.other.error.mail?'error':'success'}}",
                      required: true,
                      colon:true,
                      label:"电子邮箱",
                      help: "{{data.other.error.mail}}",
                      children: [{
                              name: "mail",
                              component: "Input",
                              value: "{{data.form.mail}}",
                              placeholder: "请输入您的电子邮箱，可用于找回您的密码",
                              onFocus: "{{function(e){$setField('data.other.error.mail', undefined)}}}",
                              onChange:"{{function(e){$fieldChange('data.form.mail', e.target.value)}}}",
                              onBlur: "{{function(e){$fieldChange('data.form.mail', e.target.value, 'next')}}}",
                          }
                      ]
                },{
                  name: "password",
                  component: "Form.Item",
                  className: "ttk-dzgl-app-register-form-password",
                  validateStatus: "{{data.other.error.password?'error':'success'}}",
                  label:"密码",
                  required: true,
                  colon:true,
                  help: "{{data.other.error.password}}",
                  children: [
                    {
                      name: 'stopAutocompletePassword',
                      component: 'Input',
                      type: 'text',
                      autocomplete:"off",
                      style:{position: 'absolute', top: '-9999px'}
                    
                    },{
                      name: 'stopAutocompletePassword',
                      component: 'Input',
                      type: 'password',
                      autocomplete:"new-password",
                      style:{position: 'absolute', top: '-9999px'}
                    
                    },{
                      name: "password",
                      component: "Input",
                      type: "password",
                      value: "{{data.form.password}}",
                      placeholder:"请输入密码（6-32位必须包含大、小写字母和数字）",
                      onFocus:"{{function(e){$setField('data.other.error.password', undefined)}}}",
                      onChange:"{{function(e){$fieldChange('data.form.password', e.target.value)}}}",
                      onBlur:"{{function(e){$fieldChange('data.form.password', e.target.value, 'next')}}}",
                    }
                  ]
                },{
                  name: "passwordAgain",
                  component: "Form.Item",
                  className: "ttk-dzgl-app-register-form-password",
                  validateStatus: "{{data.other.error.passwordAgain?'error':'success'}}",
                  // _visible: "{{data.other.step==1}}",
                  label:"确认密码",
                  required: true,
                  colon:true,
                  help: "{{data.other.error.passwordAgain}}",
                  children: [{
                      name: "passwordAgain",
                      component: "Input",
                      type: "password",
                      value: "{{data.form.passwordAgain}}",
                      placeholder:"请输入密码（6-32位必须包含大、小写字母和数字）",
                      onFocus:"{{function(e){$setField('data.other.error.passwordAgain', undefined)}}}",
                      onChange:"{{function(e){$fieldChange('data.form.passwordAgain', e.target.value)}}}",
                      onBlur:"{{function(e){$fieldChange('data.form.passwordAgain', e.target.value, 'next')}}}",
                    }
                  ]
                },{
                      name: "form-footer",
                      component: "::div",
                      className: "ttk-dzgl-app-register-form-footer",
                      children: [
                          {
                              name: "rule",
                              component: "::div",
                              className: "ttk-dzgl-app-register-form-footer-rule",
                              children: [
                                  {
                                      name: "checkbox",
                                      component: "Checkbox",
                                      checked: "{{data.form.userAgree}}",
                                      onChange:
                                          '{{function(e){$sf("data.form.userAgree", e.target.checked)}}}',
                                      children: "我已阅读并同意"
                                  },
                                  {
                                      name: "content",
                                      component: "::a",
                                      href: "javascript:;",
                                      onClick: "{{$openRuleContent}}",
                                      children: "《服务协议》"
                                  }
                              ]
                          },
                      ]
                },{
                      name: "form-button",
                      component: "::div",
                      className: "ttk-dzgl-app-register-form-footerButton",
                      children: [
                          {
                              name: "submit",
                              component: "Button",
                              className: "ttk-dzgl-app-register-form-submit",
                              onClick: "{{$submitClick}}",
                              disabled: '{{$checkDisabled("register")}}',
                              type: "softly",
                              children: "注册"
                          },{
                              name: "back",
                              component: "Button",
                              className: "ttk-dzgl-app-register-form-submit",
                              onClick: "{{$goLogin}}",
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
                              onClick: '{{function(e){$setField("data.form.hasUser", true);}}}',
                              children: "已有账号，请登录"
                          }
                      ]
                },]
              },{
                //登录
                name:'login',    
                component:'::div',
                _visible: '{{data.form.hasUser}}',
                className: 'ttk-dzgl-app-register-form-login',
                children:[ {
                  name: 'mobileItem',
                  component: 'Form.Item',
                  className: 'ttk-dzgl-app-forget-password-form-mobile',
                  validateStatus: "{{data.other.error.userMobile?'error':'success'}}",
                  help: '{{data.other.error.userMobile}}',
                  label:"账号",
                  required: true,
                  colon:true,
                  children: [{
                    name: 'userMobile',
                    component: 'Input',
                    className: 'mobileInput',
                    autoFocus: true,
                    tabIndex: 1,
                    value: '{{data.form.userMobile}}',
                    placeholder: "请输入绑定手机号",
                    onFocus: `{{function(){$setField('data.other.error.userMobile',undefined)}}}`,
                    onChange: `{{function(e){$fieldChange('data.form.userMobile',e.target.value)}}}`,
                    onBlur: `{{function(e){$fieldChange('data.form.userMobile',e.target.value,'login')}}}`,
                   
                  }]
                },{
                  name: 'userPassword',
                  component: 'Form.Item',
                  validateStatus: "{{data.other.error.userPassword?'error':'success'}}",
                  help: '{{data.other.error.userPassword}}',
                  className: 'ttk-dzgl-app-register-form-password',
                  label:"密码",
                  required: true,
                  colon:true,
                  children: [{
                    name: 'userPassword',
                    component: 'Input',
                    placeholder: '请输入您的密码',
                    type: 'password',
                    onFocus: "{{function(e){$setField('data.other.error.userPassword', undefined)}}}",
                    onChange: `{{function(e){$setField('data.other.error.userPassword', undefined);$setField('data.other.userInput', true);$setField('data.form.userPassword', e.target.value)}}}`,
                    onBlur:"{{function(e){$fieldChange('data.form.userPassword', e.target.value, 'next')}}}",
                    value: '{{data.form.userPassword}}',
                  }]
                },{
                  name: "form-button",
                  component: "::div",
                  className: "ttk-dzgl-app-register-form-footerButton",
                  children: [
                      {
                          name: "submit",
                          component: "Button",
                          className: "ttk-dzgl-app-register-form-submit",
                          onClick: "{{$login}}",
                          disabled: '{{$checkDisabled("login")}}',
                          type: "softly",
                          children: "登录"
                      },{
                          name: "back",
                          component: "Button",
                          className: "ttk-dzgl-app-register-form-submit",
                          onClick: "{{$goLogin}}",
                          children: "取消"
                      },
                  ]
            },{
                  name: "form-reLogin",
                  component: "::div",
                  className: "ttk-dzgl-app-register-form-footerLink",
                  children: [
                      {
                          name: "content",
                          component: "::a",
                          style: { marginBottom: '15px'},
                          href: "javascript:;",
                          onClick: '{{function(e){$setField("data.form.hasUser", false);}}}',
                          children: "没有账号，请注册"
                      }
                  ]
            }, 
              ]
              }
            ]
        },{ 
          //注册机构
            name: 'registerOrg',
            component: '::div',
            _visible: '{{data.other.step==2}}',
            children:[{
                name: "rgComponyNameForm",
                component: "Form.Item",
                className: "ttk-dzgl-app-register-form-orgname",
                validateStatus: "{{data.other.error.rgComponyName?'error':'success'}}",
                // _visible: "{{data.other.step==1}}",
                help: "{{data.other.error.rgComponyName}}",
                label:"机构名称",
                style: {marginBottom: '40px'},
                extra:'*一个机构请申请一次，其他会计系统内自加！',
                required: true,
                colon:true,
                children: [{
                    name: "rgComponyName",
                    component: "Input",
                    // autoFocus: true,
                    value: "{{data.form.rgComponyName}}",
                    placeholder: "请输入机构名称",
                    onFocus:"{{function(e){$setField('data.other.error.rgComponyName', undefined)}}}",
                    onChange:"{{function(e){$fieldChange('data.form.rgComponyName', e.target.value)}}}",
                    onBlur:"{{function(e){$fieldChange('data.form.rgComponyName', e.target.value, 'next')}}}",
                }]
            },{
              name: "componyAddressForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-form-area",
              validateStatus: "{{data.other.error.componyAddress?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.componyAddress}}",
              label:"所属区域",
              required: true,
              colon:true,
              children: [
              {
                name: 'detail',
                component: 'Address',
                value: {disabled: false},
                showDetail: false,
                width: 100,
                height: 30,
                provinces: '{{data.form.registeredProvincial}}',
                citys: '{{data.form.registeredCity}}',
                districts: '{{data.form.registeredCounty}}',
                text: '{{data.form.registeredAddress}}',
                onChange: "{{function(e) {$setAddress(e)}}}",
                getPopupContainer:".ttk-dzgl-app-register-form-container",
              }]
            },
            {
              name: "componyAddressInfoForm",
              component: "Form.Item",
              className: "ttk-dzgl-app-register-form-componyaddress",
              validateStatus:
                "{{data.other.error.componyAddressInfoForm?'error':'success'}}",
              // _visible: "{{data.other.step==1}}",
              help: "{{data.other.error.componyAddressInfoForm}}",
              label:"详细地址",
              colon:true,
              children: [{
                  name: "componyAddressInfo",
                  component: "Input.TextArea",
                  timeout:true,
                  value: "{{data.form.componyAddressInfoForm}}",
                  placeholder: "请输入机构的详细地址",
                  onFocus:"{{function(e){$setField('data.other.error.componyAddressInfoForm', undefined)}}}",
                  onChange: "{{function(e){$fieldChange('data.form.componyAddressInfoForm', e.target.value)}}}",
                  onBlur:"{{function(e){$fieldChange('data.form.componyAddressInfoForm', e.target.value, 'next')}}}",
                }
              ]
            },{
                name: "nameForm",
                component: "Form.Item",
                className: "ttk-dzgl-app-register-form-componyname",
                validateStatus: "{{data.other.error.contactsName?'error':'success'}}",
                // _visible: "{{data.other.step==1}}",
                help: "{{data.other.error.contactsName}}",
                label:"联系人",
                required: true,
                colon:true,
                children: [{
                    name: "name",
                    component: "Input",
                    // autoFocus: true,
                    value: "{{data.form.contactsName}}",
                    placeholder: "请输入联系人名称",
                    onFocus:"{{function(e){$setField('data.other.error.contactsName', undefined)}}}",
                    onChange:"{{function(e){$fieldChange('data.form.contactsName', e.target.value)}}}",
                    onBlur: "{{function(e){$fieldChange('data.form.contactsName', e.target.value, 'next')}}}",
                    }
                ]
              },
              {
                name: "mobileForm",
                component: "Form.Item",
                className: "ttk-dzgl-app-register-form-mobile",
                validateStatus: "{{data.other.error.contactsPhone?'error':'success'}}",
                // _visible: "{{data.other.step==1}}",
                help: "{{data.other.error.contactsPhone}}",
                label:"联系电话",
                required: true,
                colon:true,
                children: [{
                    name: "contactsPhone",
                    component: "Input",
                    value: "{{data.form.contactsPhone}}",
                    placeholder: "请输入联系电话",
                    onFocus:"{{function(e){$setField('data.other.error.contactsPhone', undefined)}}}",
                    onChange:"{{function(e){$fieldChange('data.form.contactsPhone', e.target.value)}}}",
                    onBlur:"{{function(e){$fieldChange('data.form.contactsPhone', e.target.value, 'next')}}}",
                  }
                ]
            },
            {
              name: "form-footer",
              component: "::div",
              className: "ttk-dzgl-app-register-form-footer",
                style: {marginTop: '25px',},
              children: [
                {
                  name: "rule",
                  component: "::div",
                  className: "ttk-dzgl-app-register-form-footer-rule",
                  children: [
                    {
                      name: "checkbox",
                      component: "Checkbox",
                      checked: "{{data.form.agree}}",
                      onChange:
                        '{{function(e){$sf("data.form.agree", e.target.checked)}}}',
                      children: "我已阅读并同意"
                    },
                    {
                      name: "content",
                      component: "::a",
                      href: "javascript:;",
                      onClick: "{{$openRuleContent}}",
                      children: "《服务协议》"
                    }
                  ]
                }
              ]
            },{
              name: "form-button",
              component: "::div",
              className: "ttk-dzgl-app-register-form-footerButton",
              children: [
                  {
                      name: "submit",
                      component: "Button",
                      className: "ttk-dzgl-app-register-form-submit",
                      onClick: "{{$registerOrg}}",
                      disabled: '{{$checkDisabled("registerOrg")}}',
                      type: "softly",
                      children: "注册"
                  },{
                      name: "back",
                      component: "Button",
                      className: "ttk-dzgl-app-register-form-submit",
                      onClick: "{{$goLogin}}",
                      children: "取消"
                  },
              ]
            },
          ]
        }, {
            name: 'relogin',
            component: '::div',
            className: 'ttk-dzgl-app-forget-password-form-relogin',
            _visible: '{{data.other.step==3}}',
            children:[{
              name: 'success',
              component: '::div',
              children: [{
                name: 'successIcon',
                component: 'Icon',
                fontFamily: 'edficon',
                type: 'chenggongtishi',
                style:{color:'#00b38a'}

              }, {
                name: 'text',
                component: '::span',
                style: {marginLeft: '8px'},
                children: '机构注册成功'
              }]
            },{
              name: "form-button",
              component: "::div",
              className: "ttk-dzgl-app-register-form-footerButton",
              children: [
                  {
                      name: "submit",
                      component: "Button",
                      className: "ttk-dzgl-app-register-form-submit",
                      onClick: "{{$goLogin}}",
                      type: "primary",
                      children: "立即登录"
                  }
              ]
            }]
          },]
        },]
      },
      {
        name: "footer",
        className: "ttk-dzgl-app-register-footer",
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
        className: "ttk-dzgl-app-register-footer-mobile",
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
        name: "",
        mail: "",
        componyname: "",
        mobile: "",
        select: 1,
        captcha: "",
        password: "",
        passwordAgain: "",
        userMobile:"",
        userPassword:"",
        contactsPhone:"",
        sign: null,
        agree: true,
        loginStatus: true,
        hasUser:false,
        componyAddress: [],
        componyAddressInfoForm: "",
        rgComponyName: "",
        userAgree:true,
      },
      time: "获取验证码",
      timeStaus: true,
      other: {
        userInput: false,
        sysOrg: {},
        step: 1,
        error: {},
        editDate: false,
        editStandard: false,
        selectOption: []
      }
    }
  };
  return state;
}
