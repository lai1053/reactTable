import QRCode from "./img/QRcode.jpeg"

export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "ttk-dzgl-app-login",
        children: [
            {
                name: "header",
                className: "ttk-dzgl-app-login-header",
                component: "Layout",
                children: [
                    {
                        name: "header-left",
                        component: "Layout",
                        className: "ttk-dzgl-app-login-header-left",
                        children: [
                            {
                                name: "logo",
                                component: "::img",
                                className:
                                    "ttk-dzgl-app-login-header-left-logo",
                                onClick: "{{$goLanding}}",
                                // src: "{{appBasicInfo.assetUrl  + '/logo_login_jc.png'}}"
                                src:
                                    "{{appBasicInfo.assetUrl ?  appBasicInfo.assetUrl + '/logo_login_jc.png' : './vendor/img/transparent/logo_login_jc.png'}}"

                                // },
                                // {
                                //  name: 'sitename',
                                //  component: '::span',
                                //  className: 'ttk-dzgl-app-login-header-left-sitename',
                                //  children: '金财管家'
                            },
                            {
                                name: "split",
                                component: "::div",
                                className:
                                    "ttk-dzgl-app-login-header-left-split"
                            },
                            {
                                name: "item",
                                className:
                                    "ttk-dzgl-app-login-header-left-login",
                                component: "::span",
                                children: "企业登录"
                            },
                            {
                                name: "gzlogo",
                                component: "::img",
                                className:
                                    "ttk-dzgl-app-login-header-left-logo",
                                onClick: "{{$goLanding}}",
                                _visible:
                                    "{{!(appBasicInfo.isxdz && !appBasicInfo.doubleLogo)}}",
                                src:
                                    "{{appBasicInfo.assetUrl ?  appBasicInfo.assetUrl + '/logo_login_xdz.png' : './vendor/img/transparent/logo_login_xdz.png'}}"
                                // src: "{{appBasicInfo.assetUrl  + '/logo_login_xdz.png'}}"
                            }
                        ]
                    },
                    {
                        name: "header-right",
                        className: "ttk-dzgl-app-login-header-right",
                        component: "::a",
                        onClick: "{{$gotoLoad}}",
                        _visible: "{{$gjClientV()}}",
                        children: "客户端下载"
                    }
                ]
            },
            {
                name: "content",
                className: "ttk-dzgl-app-login-content",
                component: "Layout",
                children: [
                    {
                        name: "service",
                        component: "Movable",
                        className: "service",
                        _visible:
                            "{{appBasicInfo.orgDataSourceType == 'FZYM' }}",
                        key: "{{data.service.mathRandom}}",
                        style: {
                            width: "30px",
                            height: "49px",
                            color: "#ffffff",
                            right: "0",
                            top: "186px"
                        },
                        isStopX: true,
                        children: [
                            {
                                name: "qrcode",
                                component: "::div",
                                className: "qrcode",
                                children: {
                                    name: "item",
                                    component: "::div",
                                    className: "container",
                                    children: [
                                        {
                                            name: "img",
                                            component: "::img",
                                            src: QRCode,
                                            className: "qrcodeImg"
                                        },
                                        {
                                            name: "item",
                                            component: "::div",
                                            className: "content",
                                            children: "扫一扫联系客服"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        name: "bgs",
                        className: "ttk-dzgl-app-login-content-bgs",
                        component: "::div",
                        // children: {
                        //  name: 'bigBackground',
                        //  component: '::img',
                        //  className: 'ttk-dzgl-app-login-content-bgs-jpg',
                        //  _visible: "{{appBasicInfo.orgDataSourceType != 'FZYM' }}",
                        //  src: './vendor/img/dz/login-dz-big-bg.png'
                        // }
                        children: "{{$renderCal()}}"
                    },
                    {
                        name: "Cal",
                        className: "ttk-dzgl-app-login-content-bgs",
                        component: "::div",
                        _visible:
                            "{{appBasicInfo.orgDataSourceType == 'FZYM' }}",
                        children: "{{$renderCal()}}"
                    },
                    {
                        name: "container",
                        className: "container",
                        component: "::div",
                        children: [
                            {
                                name: "form",
                                component: "Form",
                                className: "ttk-dzgl-app-login-content-form",
                                _visible: "{{data.isHaveValidOrder}}",
                                onSubmit: "{{$login}}",
                                children: [
                                    {
                                        name: "item1",
                                        component: "Form.Item",
                                        className:
                                            "ttk-dzgl-app-login-content-form-title",
                                        children:
                                            '{{"欢迎登录" + (appBasicInfo.name || "") +"系统"}}'
                                    },
                                    {
                                        name: "item2",
                                        component: "Form.Item",
                                        validateStatus:
                                            "{{data.other.error.mobile?'error':'success'}}",
                                        help: "{{data.other.error.mobile}}",
                                        className:
                                            "ttk-dzgl-app-login-content-form-mobile",
                                        children: [
                                            {
                                                name: "mobile",
                                                component: "Input",
                                                autoFocus: "autoFocus",
                                                placeholder: "请输入您的账号",
                                                onFocus:
                                                    "{{function(e){$setField('data.other.error.mobile', undefined)}}}",
                                                onChange:
                                                    "{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
                                                onBlur:
                                                    "{{function(e){$fieldChange('data.form.mobile', e.target.value, 'login')}}}",
                                                value: "{{data.form.mobile}}",
                                                prefix: {
                                                    name: "userIcon",
                                                    component: "Icon",
                                                    fontFamily: "edficon",
                                                    type: "XDZyonghuming"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "item3",
                                        component: "Form.Item",
                                        validateStatus:
                                            "{{data.other.error.password?'error':'success'}}",
                                        help: "{{data.other.error.password}}",
                                        className:
                                            "ttk-dzgl-app-login-content-form-password",
                                        children: [
                                            {
                                                name:
                                                    "stopAutocompletePassword",
                                                component: "Input",
                                                type: "password",
                                                tabindex: "-1",
                                                autocomplete: "new-password",
                                                style: {
                                                    position: "absolute",
                                                    top: "-9999px"
                                                }
                                            },
                                            {
                                                name: "password",
                                                component: "Input",
                                                placeholder: "请输入您的密码",
                                                type: "password",
                                                onFocus:
                                                    "{{function(e){$setField('data.other.error.password', undefined)}}}",
                                                onChange: `{{function(e){$setField('data.other.error.password', undefined);$setField('data.other.userInput', true);$setField('data.form.password', e.target.value)}}}`,
                                                onBlur: `{{function(e){$fieldChange('data.form.password', e.target.value)}}}`,
                                                value: "{{data.form.password}}",
                                                prefix: {
                                                    name: "passwordIcon",
                                                    component: "Icon",
                                                    fontFamily: "edficon",
                                                    type: "XDZmima"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "captchaItem",
                                        component: "Form.Item",
                                        className:
                                            "ttk-dzgl-app-login-content-form-captcha",
                                        validateStatus:
                                            "{{data.other.error.captcha?'error':'success'}}",
                                        help: "{{data.other.error.captcha}}",
                                        required: true,
                                        _visible: "{{!data.isValidate}}",
                                        children: [
                                            {
                                                name: "captcha",
                                                component: "Input",
                                                value: "{{data.form.captcha}}",
                                                placeholder: "请输入验证码",
                                                type: "captcha",
                                                className: "captchaInput",
                                                onFocus:
                                                    "{{function(){$setField('data.other.error.captcha',undefined)}}}",
                                                onChange:
                                                    "{{function(e){$setField('data.form.captcha',e.target.value)}}}",
                                                onBlur:
                                                    "{{function(e){$fieldChange('data.form.captcha',e.target.value, 'next')}}}",
                                                prefix: {
                                                    name: "captchaIcon",
                                                    component: "Icon",
                                                    // theme:'filled',
                                                    // fontFamily: 'edficon',
                                                    type: "safety"
                                                },
                                                addonAfter: {
                                                    name: "suffix",
                                                    component: "Button",
                                                    tabIndex: 2,
                                                    style: { width: "80px" },
                                                    className: "getCaptchaCode",
                                                    disabled:
                                                        "{{!data.form.mobile || !!data.other.error.mobile || !data.timeStaus}}",
                                                    onClick: "{{$getCaptcha}}",
                                                    children: "{{data.time}}"
                                                }
                                            },
                                            {
                                                name: "register",
                                                component: "::a",
                                                style: {
                                                    fontSize: "13px",
                                                    float: "right",
                                                    lineHeight: "22px"
                                                },
                                                onClick: "{{$goChangeMobile}}",
                                                children: "号码已更换"
                                            }
                                        ]
                                    },
                                    {
                                        name: "item4",
                                        component: "Form.Item",
                                        _visible: "{{data.isValidate}}",
                                        className:
                                            "ttk-dzgl-app-login-content-form-more",
                                        children: [
                                            {
                                                name: "remember",
                                                component: "Checkbox",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-more-remember",
                                                checked:
                                                    "{{data.form.remember}}",
                                                onChange: `{{function(e){$fieldChange('data.form.remember', e.target.checked)}}}`,
                                                children: "记住密码"
                                            },
                                            //     {
                                            //     name: 'register',
                                            //     className: 'ttk-dzgl-app-login-content-form-more-register',
                                            //     component: '::a',
                                            //     style: { float: 'right' },
                                            //     onClick: '{{$goRegisterB}}',
                                            //     children: '立即注册'
                                            // }, {
                                            //     name: '',
                                            //     component: '::i',
                                            //     style: { float: 'right', margin: '0 10px', fontStyle: 'normal', fontSize: '13px', lineHeight: '36px' },
                                            //     children: '|'
                                            // },
                                            {
                                                name: "forgot",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-more-forget",
                                                component: "::a",
                                                style: { float: "right" },
                                                onClick: "{{$goForgot}}",
                                                children: "忘记密码"
                                            }
                                        ]
                                    },
                                    {
                                        name: "item5",
                                        component: "Form.Item",
                                        className:
                                            "ttk-dzgl-app-login-content-form-login",
                                        children: [
                                            {
                                                name: "loginBtn",
                                                component: "Button",
                                                type: "softly",
                                                disabled: "{{$checkLogin()}}",
                                                children: "登录",
                                                onClick: "{{$login}}"
                                            }
                                        ]
                                    },
                                    {
                                        name: "item6",
                                        component: "Form.Item",
                                        className:
                                            "ttk-dzgl-app-login-content-form-more",
                                        children: [
                                            {
                                                name: "register",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-more-forget",
                                                component: "::a",
                                                style: { float: "right" },
                                                onClick: "{{$goRegisterB}}",
                                                _visible:
                                                    "{{appBasicInfo.orgDataSourceType != 'FZYM' }}",
                                                children: "立即注册"
                                            },
                                            {
                                                name: "customer",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-more-customer",
                                                component: "::a",
                                                _visible:
                                                    "{{appBasicInfo.orgDataSourceType != 'FZYM' }}",
                                                style: { float: "left" },
                                                id: "starConversation",
                                                children: "客服"
                                            },
                                            {
                                                name: "imchat",
                                                component: "AppLoader",
                                                appName: "ttk-es-app-im",
                                                groupNo: "10011067",
                                                // groupNo: '10341037',
                                                eno: "anyone",
                                                thirdPartySession: "123"
                                            }

                                            // , {
                                            //     name: '',
                                            //     component: '::i',
                                            //     style: { float: 'right', margin: '0 10px', fontStyle: 'normal', fontSize: '13px', lineHeight: '36px' },
                                            //     children: '|'
                                            // }, {
                                            //     name: 'forgot',
                                            //     className: 'ttk-dzgl-app-login-content-form-more-forget',
                                            //     component: '::a',
                                            //     style: { float: 'right' },
                                            //     onClick: '{{$goForgot}}',
                                            //     children: '忘记密码'
                                            // }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "failLogin",
                                className: "ttk-dzgl-app-login-content-form",
                                component: "::div",
                                _visible: "{{!data.isHaveValidOrder}}",
                                style: { display: "flex", padding: "0 45px" },
                                children: [
                                    {
                                        name: "failText",
                                        component: "::div",
                                        className:
                                            "ttk-dzgl-app-login-content-form-info",
                                        children: [
                                            {
                                                name: "isExpire-jjinggao",
                                                component: "Icon",
                                                type: "exclamation-circle",
                                                style: {
                                                    fontSize: "28px",
                                                    paddingRight: "10px"
                                                }
                                            },
                                            {
                                                name: "text",
                                                component: "::span",
                                                children: "登录失败"
                                            }
                                        ]
                                    },
                                    {
                                        name: "companyList",
                                        component: "::div",
                                        style: { flex: 6 },
                                        children: [
                                            {
                                                name: "title",
                                                component: "::p",
                                                children: "您的公司:"
                                            },
                                            {
                                                name: "list",
                                                component: "::ul",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-list",
                                                children: [
                                                    {
                                                        name: "listItem",
                                                        component: "::li",
                                                        key:
                                                            "{{data.newslist[_rowIndex].nama }}",
                                                        _power:
                                                            "for in data.newslist",
                                                        children: [
                                                            {
                                                                name: "news",
                                                                component:
                                                                    "::span",
                                                                className:
                                                                    "ttk-edf-app-article-title",
                                                                // style: {right: '{{data.newslist[_rowIndex].isHot ? "110px" : "80px"}}'},
                                                                children:
                                                                    "{{data.newslist[_rowIndex].name}}"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                name: "text",
                                                component: "::span",
                                                className:
                                                    "ttk-dzgl-app-login-content-form-more",
                                                children: [
                                                    "尚未签订使用金财代账产品的协议。请您与您的客户经理联系，如有问题，请咨询",
                                                    {
                                                        name: "customer",
                                                        component: "::a",
                                                        style: {
                                                            color: "#0066B3",
                                                            lineHeight: "28px",
                                                            fontSize: "14px"
                                                        },
                                                        id: "starConversation",
                                                        children: "客服"
                                                    },
                                                    "， 谢谢"
                                                ]
                                            },
                                            {
                                                name: "imchat",
                                                component: "AppLoader",
                                                appName: "ttk-es-app-im",
                                                groupNo: "10011067",
                                                eno: "anyone",
                                                thirdPartySession: "123"
                                            }
                                        ]
                                    },
                                    {
                                        name: "cancelButton",
                                        component: "::div",
                                        className:
                                            "ttk-dzgl-app-login-content-form-cancel",
                                        children: [
                                            {
                                                name: "loginBtn",
                                                component: "Button",
                                                className: "cancelStyle",
                                                children: "取消",
                                                onClick:
                                                    "{{function(){$setField('data.isHaveValidOrder',true)}}}"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "footer",
                className: "ttk-dzgl-app-login-footer",
                component: "Layout",
                children: [
                    {
                        name: "item1",
                        component: "::p",
                        children: [
                            {
                                name: "item1",
                                component: "::span",
                                children: "{{appBasicInfo.name}}"
                            },
                            {
                                name: "version",
                                id: "lbl-version",
                                component: "::span",
                                children: "{{data.other.version}}"
                            },
                            {
                                name: "item2",
                                component: "::span",
                                children:
                                    '{{" 版权所有 © 2018 " + (appBasicInfo.companyName || "") +" "}}'
                            },
                            {
                                name: "item3",
                                component: "::span",
                                children: "{{appBasicInfo.copyright1}}"
                            },
                            {
                                name: "item4",
                                component: "::a",
                                target: "_blank",
                                style: { color: "#a1a1a1" },
                                href: "{{appBasicInfo.beianDomain}}",
                                children: "{{appBasicInfo.copyright2}}"
                            },
                            {
                                name: "item5",
                                component: "::span",
                                children: "{{appBasicInfo.copyright3}}"
                            }
                        ]
                    }
                ]
            },
            {
                name: "footer",
                className: "ttk-dzgl-app-login-footer-mobile",
                component: "Layout",
                children: [
                    {
                        name: "item1",
                        component: "::p",
                        children: [
                            {
                                name: "item1",
                                component: "::span",
                                children:
                                    '{{"版权所有 © 2019 " + (appBasicInfo.companyNameShort || "")}}'
                            }
                        ]
                    }
                ]
            },
            {
                name: "browserCheck",
                className: "ttk-dzgl-app-login-browserCheck",
                _visible: "{{data.other.checkTips ? true :false}}",
                component: "::div",
                children: {
                    name: "browserCheck-middle",
                    className: "ttk-dzgl-app-login-browserCheck-middle",
                    component: "::span",
                    children: [
                        {
                            name: "warning-ico",
                            component: "::img",
                            className: "ttk-dzgl-app-login-browserCheck-img",
                            src: require("./img/warning.png")
                        },
                        {
                            name: "warning-test",
                            component: "::span",
                            className: "ttk-dzgl-app-login-browserCheck-title",
                            children: "建议使用PC端登录"
                        },
                        {
                            name: "warning-close",
                            component: "::img",
                            onClick: "{{$closeTips}}",
                            className: "ttk-dzgl-app-login-browserCheck-close",
                            src: require("./img/close.png")
                        }
                    ]
                }
            }
            /*{
                        name: 'stepTips',
                        component: 'Step',
                        enabled: true,
                        stepsEnabled: true,
                        initialStep: 0,
                        steps: [
                            {
                                element: '.ttk-dzgl-app-login-content-form-more-register',
                                intro: '点我注册账号',
                            }, {
                                element: '.ttk-dzgl-app-login-content-form-more-forget',
                                intro: '忘记密码怎么办?',
                            }
                        ],
                        onExit: "{{$onExit}}"
                    }*/
        ]
    }
}

export function getInitState() {
    return {
        data: {
            newslist: [],
            form: {
                account: "",
                password: "",
                mobile: "",
                captcha: "",
                remember: false,
                sign: null
            },
            time: "获取验证码",
            timeStaus: true,
            isValidate: true,
            isHaveValidOrder: true,
            other: {
                error: {},
                selectedImgIndex: 0,
                imgs: [],
                userInput: false,
                checkTips: false,
                version: ""
            },
            service: {
                mathRandom: Math.random()
            }
        }
    }
}
