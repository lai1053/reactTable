import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: '{{data.other.bsgztAccess == 1 ?"edfx-app-portal noTop":"edfx-app-portal"}}',
        children: [{
            name: 'isExpire',
            component: '::div',
            // className: 'edfx-app-portal-isExpire',
            className: '{{data.other.isExpireStatus == 2 ? "edfx-app-portal-isExpire edfx-app-portal-isExpireRed" : "edfx-app-portal-isExpire"}}',
            _visible: '{{data.other.bsgztAccess != 1 && data.other.isExpireStatus != 0}}',
            // style: '{{$getPortalStyle()}}',
            children: [
                {
                    name: 'isExpire-jjinggao',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'jinggao',
                    style: {
                        fontSize: '18px',
                        paddingLeft: '20px',
                        paddingRight: '10px'
                    }
                }, {
                    name: 'isExpire-text',
                    component: '::span',
                    className: 'edfx-app-portal-isExpire-text',
                    children: '{{data.other.isExpireText}}'
                }, {
                    name: 'isExpire-textCity',
                    component: '::span',
                    className: 'edfx-app-portal-isExpire-text',
                    // _visible: "{{!(data.appVersion == 104)}}",
                    _visible: false,
                    style: {
                        marginRight: '5px'
                    },
                    children: '北京用户请'
                }, {
                    name: 'isExpire-text',
                    component: '::span',
                    className: 'edfx-app-portal-isExpire-text',
                    children: [{
                        component: '::span',
                        children: '激活',
                        className: 'edfx-app-portal-isExpire-buyBotton',
                        onClick: '{{$productActivate}}',
                        style: {
                            marginRight: '20px'
                        }
                    }, {
                        name: 'isExpire-textCity',
                        component: '::span',
                        children: '其他省市用户请',
                        // _visible: "{{!(data.appVersion == 104)}}",
                        _visible: false,
                        style: {
                            marginRight: '5px'
                        },
                    }, {
                        component: '::span',
                        children: '购买',
                        // _visible: "{{!(data.appVersion == 104)}}",
                        _visible: false,
                        className: 'edfx-app-portal-isExpire-buyBotton',
                        onClick: '{{$productBuy}}'
                    }
                    ]
                }, {
                    name: 'isExpire-guanbi',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'guanbi',
                    className: 'edfx-app-portal-isExpire-icon',
                    style: {
                        fontSize: '22px',
                        cursor: 'pointer',
                        paddingRight: '20px'
                    },
                    title: '关闭',
                    onClick: '{{function(){$sf("data.other.isExpireStatus",0)}}}'
                }
            ]
        },
        {
            name: 'header',
            component: 'Layout',
            className: '{{data.other.isExpireStatus != 0 ? "edfx-app-portal-header edfx-app-portal-header-isExpire" : "edfx-app-portal-header"}}',
            style: '{{$getPortalStyle()}}',
            _visible: "{{data.other.bsgztAccess != 1 && data.fold =='zhankai'?true:false}}",
            children: [
                {
                    name: 'left',
                    component: 'Layout',
                    className: 'edfx-app-portal-header-left',
                    // _visible: '{{data.isShowMenu}}',
                    children: [{
                        name: 'logo',
                        component: '::img',
                        className: 'edfx-app-portal-header-left-logo',
                        onClick: '{{$goLanding}}',
                        // src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_erp.png'}}"
                        src: "{{data.logoImg ? data.logoImg : './vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_erp.png'}}"
                    },
                        // {
                        //     name: 'siteName',
                        //     component: '::h1',
                        //     children: '金财管家'
                        // }
                    ]
                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'edfx-app-portal-header-right',
                    children: [{
                        name: 'internal',
                        component: '::div',
                        className: 'orgName esOrgName',
                        _visible: '{{data.appVersion == 114 && data.headCtrl}}',
                        onClick: '{{$getOrgs}}',
                        style: {
                            margin: '0px 2px', float: 'left', height: '54px', lineHeight
                                : '54px', padding: '0 10px'
                        },
                        children: [{
                            name: 'currentOrg',
                            component: '::span',
                            title: "{{$getOrgName()}}",
                            children: "{{$getOrgName()}}",
                            className: 'currentOrgName',
                        }]
                    }, {
                        name: 'common',
                        component: 'Popover',
                        overlayClassName: '{{data.other.isExpireStatus != 0 ? "popoverDown popoverDown_expire popoverDownLeft" : "popoverDown popoverDownLeft"}}',
                        trigger: 'click',
                        _visible: '{{data.appVersion != 114}}',
                        visible: '{{data.visible}}',
                        onVisibleChange: '{{$handleVisibleChange}}',
                        style: { padding: '0px 10px' },
                        className: 'edfx-app-portal-header-right-menu',
                        placement: 'bottomLeft',
                        content: [
                            {
                                name: 'menu',
                                component: 'Menu',
                                children: [
                                    {
                                        name: 'itemSearch',
                                        component: 'Input.Search',
                                        style: { padding: '3px 5px', borderBottom: '1px solid rgb(228, 228, 228)' },
                                        className: 'edfx-app-portal-header-right-menu-deptSearch',
                                        placeholder: '搜索企业',
                                        _visible: '{{data.manageList && data.manageList.length >= 8}}',
                                        //      onChange: `{{function(e){
                                        //     var list = []
                                        //     if(e.target.value == ''){
                                        //         list = data.manageList
                                        //     }else{
                                        //         data.manageList.forEach(function(listData){
                                        //             if(listData.name.indexOf(e.target.value) > -1){
                                        //                 list.push(listData)
                                        //             }
                                        //         })
                                        //     };
                                        //    $manageListShow(list)
                                        // }}}`
                                        onChange: '{{function(e){$manageListShow(e.target.value)}}}'
                                    }
                                ]
                            },
                            {
                                name: 'menu',
                                component: 'Menu',
                                style: { width: '100%' },
                                onClick: '{{$toggleManage}}',
                                children: {
                                    name: 'item1',
                                    component: 'Menu.Item',
                                    style: { padding: '0px', paddingLeft: '8px', paddingRight: '8px', height: '36px', lineHeight: '36px', maxWith: '320px', fontSize: '14px' },
                                    className: 'edfx-app-portal-header-right-menu-item1',
                                    title: '{{data.manageListShow[_rowIndex].name}}',
                                    disabled: '{{!!data.manageListShow[_rowIndex].disabled}}',
                                    _visible: '{{!(data.manageListShow[_rowIndex].importAccountStatus && data.manageListShow[_rowIndex].importAccountStatus == 1)}}',
                                    children: '{{data.manageListShow[_rowIndex].name}}',
                                    key: '{{data.manageListShow[_rowIndex].id}}', //把 key 从 name 修改为 id
                                    _power: 'for in data.manageListShow'
                                }
                            },
                            {
                                name: 'item2',
                                component: '::div',
                                _visible: '{{!(data.appVersion == 107 || data.appVersion == 114)}}',
                                // _visible: '{{!((data.appVersion == 107 && sessionStorage["dzSource"] == 1) || data.appVersion == 114)}}',
                                style: { borderTop: '1px solid #e4e4e4', backgroundColor: '#F9F8FA' },
                                children: [
                                    {
                                        name: 'org3',
                                        className: 'edfx-app-portal-header-right-org-popover-icon',
                                        component: 'Button',
                                        onClick: "{{$goCompanyManage}}",
                                        style: { height: '36px', overflow: 'hidden' },
                                        children: {
                                            name: 'container',
                                            component: '::span',
                                            children: [{
                                                name: 'setting',
                                                component: 'Icon',
                                                type: 'qiyeguanli',
                                                fontFamily: 'edficon',
                                                style: { fontSize: '22px', verticalAlign: 'middle' },
                                                className: 'edfx-app-portal-header-right-org-popover-icon-title'
                                            }, {
                                                name: 'item',
                                                component: '::span',
                                                style: { display: 'inline-block', verticalAlign: 'middle', fontSize: '14px' },
                                                children: '企业管理'
                                            }]
                                        }
                                    },
                                    {
                                        name: 'line',
                                        style: { display: 'inline-block', verticalAlign: 'middle', width: '1px', height: '25px', borderLeft: '1px dashed #8E8C8C' },
                                        component: '::div'
                                    },
                                    {
                                        name: 'org4',
                                        className: 'edfx-app-portal-header-right-org-popover-icon',
                                        component: 'Button',
                                        style: { height: '36px' },
                                        onClick: "{{$goRegister}}",
                                        children: {
                                            name: 'container',
                                            component: '::div',
                                            children: [{
                                                name: 'add_company',
                                                component: 'Icon',
                                                fontFamily: 'edficon',
                                                type: 'chuangjianqiye',
                                                style: { fontSize: '22px', verticalAlign: 'middle' },
                                            }, {
                                                name: 'item',
                                                component: '::span',
                                                style: { display: 'inline-block', verticalAlign: 'middle', fontSize: '14px' },
                                                children: '创建企业'
                                            }]
                                        }

                                    }
                                ]
                            }
                        ],
                        children: [{
                            name: 'internal',
                            component: '::div',
                            className: 'orgName',
                            _visible: '{{data.headCtrl}}',
                            onClick: '{{$getOrgs}}',
                            style: {
                                margin: '0px 2px', float: 'left', height: '54px', lineHeight
                                    : '54px', padding: '0 10px'
                            },
                            children: [{
                                name: 'currentOrg',
                                component: '::span',
                                title: "{{$getOrgName()}}",
                                children: "{{$getOrgName()}}",
                                className: 'currentOrgName',
                            },
                            {
                                name: 'down',
                                fontFamily: 'edficon',
                                component: 'Icon',
                                style: { fontSize: '22px', verticalAlign: 'middle' },
                                type: 'xia'
                            }]
                        }]
                    }, {
                        name: 'div',
                        component: '::div',
                        _visible: '{{data.headCtrl}}',
                        className: 'edfx-app-portal-header-right-leftDiv orgName',
                        children: [{
                            name: 'date',
                            component: 'DatePicker.MonthPicker',
                            className: 'edfx-app-portal-header-right-leftDiv-datepicker',
                            // dropdownClassName: 'edfx-app-portal-header-right-leftDiv-datepickerDropdown',datepickerDropdown_expire
                            dropdownClassName: '{{data.other.isExpireStatus != 0 ? "edfx-app-portal-header-right-leftDiv-datepickerDropdown edfx-app-portal-header-right-leftDiv-datepickerDropdown_expire" : "edfx-app-portal-header-right-leftDiv-datepickerDropdown"}}',
                            value: '{{data.periodDate.periodDate}}',
                            // defaultValue: '{{$periodDate()}}',
                            monthCellContentRender: '{{$monthCellCustom}}',
                            disabledDate: '{{function(value){return $disabledPeriodDate(value)}}}',
                            onChange: '{{$periodDateChange}}',
                            allowClear: false
                        }]
                    }, {
                        name: 'yijiezhang',
                        fontFamily: 'edficon',
                        component: '::div',
                        className: 'edfx-app-portal-header-right-yijiezhang',
                        _visible: '{{$isSettle()}}',
                        children: '已结账'
                    }, {
                        name: 'rightDiv',
                        component: '::div',
                        className: 'edfx-app-portal-search-rightDiv',
                        children: [{
                            name: 'backToDz',
                            component: '::span',
                            _visible: '{{data.headCtrl && ((data.appVersion == 107 && sessionStorage["dzSource"] == 1))}}',
                            className: 'liveCast edfx-app-portal-header-right-headerSearch',
                            style: { padding: '0px 16px 0 10px', cursor: 'pointer', position: 'relative' },
                            onClick: '{{$backToDz}}',
                            children: [{
                                name: 'liveCast',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                style: { fontSize: '22px', verticalAlign: 'middle', },
                                className: 'edfx-app-portal-header-right-help-icon-popover',
                                type: 'fanhuishouye',
                            }, {
                                name: 'liveName',
                                component: '::span',
                                className: 'headBarBtn',
                                children: '返回代账'
                            }]
                        }, {
                            name: 'consult',
                            component: '::span',
                            _visible: '{{data.headCtrl && !(data.appVersion == 104) && !(data.appVersion == 114)}}',
                            className: 'liveCast edfx-app-portal-header-right-headerSearch',
                            style: { padding: '0px 16px 0 10px', cursor: 'pointer', position: 'relative' },
                            onClick: '{{function(){$jumpToUrl("咨询","https://zsfw.jchl.com/portal/tk/information/index.html", 0)}}}',
                            children: [{
                                name: 'liveCast',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                style: { fontSize: '22px', verticalAlign: 'middle', },
                                className: 'edfx-app-portal-header-right-help-icon-popover',
                                type: 'zaixianbangzhuxin',
                            }, {
                                name: 'liveName',
                                component: '::span',
                                className: 'headBarBtn',
                                children: '咨询'
                            }]
                        }, {
                            name: 'train',
                            component: '::span',
                            _visible: '{{data.headCtrl && !(data.appVersion == 104) && !(data.appVersion == 114)}}',
                            className: 'liveCast edfx-app-portal-header-right-headerSearch',
                            style: { padding: '0px 16px 0 10px', cursor: 'pointer', position: 'relative' },
                            onClick: '{{function(){$jumpToUrl("培训","https://zsfw.jchl.com/portal/tk/training/page/0/index.html", 0)}}}',
                            children: [{
                                name: 'liveCast',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                style: { fontSize: '22px', verticalAlign: 'middle', },
                                className: 'edfx-app-portal-header-right-help-icon-popover',
                                type: 'zhibo',
                            }, {
                                name: 'liveName',
                                component: '::span',
                                className: 'headBarBtn',
                                children: '培训'
                            }]
                        }, {
                            name: 'message',
                            _visible: '{{data.headCtrl && !(data.appVersion == 107 && sessionStorage["dzSource"] == 1) && !(data.appVersion == 114)}}',
                            component: '::span',
                            className: 'edfx-app-portal-header-right-headerSearch',
                            style: { padding: '0px 16px 0 10px', cursor: 'pointer', position: 'relative' },
                            onClick: '{{function() {$currentStatus();$setContent("消息", "ttk-edf-app-message")}}}',
                            children: [{
                                name: 'messageIcon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                style: { fontSize: '24px', verticalAlign: 'middle' },
                                className: 'edfx-app-portal-header-right-org-menu-icon-menu',
                                type: 'xiaoxi',
                            }, {
                                name: 'news',
                                component: '::span',
                                className: 'headBarBtn',
                                children: '消息'
                            }, {
                                name: 'num',
                                component: '::span',
                                _visible: '{{data.msgNum <= 0 ? false : true}}',
                                className: 'msgNum',
                                children: '{{data.msgNum}}'
                            }]
                        }, {
                            name: 'shareQrCode',
                            component: 'Dropdown',
                            placement: 'bottomCenter',
                            // overlayClassName: 'shareQrCodePop',
                            overlayClassName: '{{data.other.isExpireStatus != 0 ? "shareQrCodePop shareQrCodePopDown" : "shareQrCodePop"}}',
                            _visible: '{{data.headCtrl && !(data.appVersion == 104) && !(data.appVersion == 107 && sessionStorage["dzSource"] == 1) && !(data.appVersion == 114)}}',
                            className: 'liveCast edfx-app-portal-header-right-headerSearch',
                            style: { padding: '0px 16px 0 10px', cursor: 'pointer', position: 'relative' },
                            overlay: {
                                name: 'item',
                                component: '::div',
                                className: 'container',
                                children: [{
                                    name: 'img',
                                    component: '::img',
                                    src: require('./img/shareqrcode.png'),
                                    className: 'qrcodeImg'
                                }, {
                                    name: 'item',
                                    component: '::div',
                                    className: 'content',
                                    children: '微信扫一扫分享给好友'
                                }]
                            },
                            children: {
                                name: 'content',
                                component: '::div',
                                children: [{
                                    name: 'qrcode',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    style: { fontSize: '22px', verticalAlign: 'middle', },
                                    className: 'edfx-app-portal-header-right-help-icon-popover',
                                    type: 'QRcode',
                                }, {
                                    name: 'invite',
                                    component: '::span',
                                    className: 'headBarBtn',
                                    children: '分享'
                                }]
                            }
                        }, {
                            //     name: 'myMessageTitle',
                            //     component: '::span',
                            //     _visible: '{{data.headCtrl}}',
                            //     className: 'helpCenter',
                            //     style: { padding: '0px 16px 0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
                            //     onClick: '{{$menuControl}}',
                            //     children: [{
                            //         name: 'solution',
                            //         component: 'Icon',
                            //         fontFamily: 'edficon',
                            //         style: { fontSize: '22px', verticalAlign: 'middle', },
                            //         className: 'edfx-app-portal-header-right-help-icon-popover',
                            //         type: 'bangzhuzhongxin',
                            //     }, {
                            //         name: 'helpName',
                            //         component: '::span',
                            //         className: 'headBarBtn',
                            //         children: "{{'帮助中心'}}"
                            //     }]
                            // }, {

                            // }, {
                            //     name: 'pop',
                            //     component: '::div',
                            //     className: 'popContent',
                            //     style: { position: 'fixed', top: '54px', right: '0px', overflow: 'hidden', height: '{{data.animation == "in"?"100%":"0" }}', width: '100%', boxSizing: 'border-box', paddingBottom: '{{data.animation == "in"?"54px":"0"}}', zIndex: '2' },
                            //     children: {
                            //         name: 'card',
                            //         component: '::div',
                            //         bordered: false,
                            //         style: { display: "{{data.showPanel}}" },
                            //         onAnimationEnd: "{{$animationEnd}}",
                            //         className: '{{data.animation == "in" ? "edfx-app-portal-header-right-help-popover animated slideInDown" : "edfx-app-portal-header-right-help-popover animated slideOutDown"}}',
                            //         // className: 'edfx-app-portal-header-right-help-popover',
                            //         children: [{
                            //             name: 'shade1',
                            //             onMouseOver: '{{$hidePanel}}',
                            //             className: 'edfx-app-portal-header-right-help-popover-shade',
                            //             component: '::div',
                            //             onClick: '{{$hidePanel}}'
                            //         }, {
                            //             name: 'shade2',
                            //             className: 'edfx-app-portal-header-right-help-popover-content',
                            //             component: '::div',

                            //             children: [{
                            //                 name: 'icon-arrow',
                            //                 component: '::div',
                            //                 className: 'ant-popover-arrow',
                            //             }, {
                            //                 name: 'titleIcon',
                            //                 component: '::div',
                            //                 className: 'edfx-app-portal-header-right-help-popover-titleIcon',
                            //                 children: [{
                            //                     name: 'helpIcon',
                            //                     component: 'Icon',
                            //                     bordered: false,
                            //                     fontFamily: 'edficon',
                            //                     style: { fontSize: '22px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '2px' },
                            //                     className: 'edfx-app-portal-header-right-help-popover-icon',
                            //                     type: 'bangzhuzhongxin'
                            //                 }, {
                            //                     name: 'helpTitle1',
                            //                     component: '::span',
                            //                     bordered: false,
                            //                     className: 'edfx-app-portal-header-right-help-popover-title1',
                            //                     children: '帮助-'
                            //                 }, {
                            //                     name: 'helpTitle2',
                            //                     component: '::span',
                            //                     bordered: false,
                            //                     className: 'edfx-app-portal-header-right-help-popover-title2',
                            //                     children: '首页'
                            //                 }]
                            //             }, {
                            //                 name: 'Search',
                            //                 component: '::div',
                            //                 // className: 'edfx-app-portal-header-right ,animated, slideInUp,',
                            //                 children: [{
                            //                     name: 'search',
                            //                     component: 'Input.Search',
                            //                     className: 'edfx-app-portal-header-right-search',
                            //                     placeholder: '提问或使用关键词搜索...',
                            //                     onSearch: '{{function(value){console.log(value)}}}'
                            //                 }]
                            //             }, {
                            //                 name: 'title',
                            //                 component: '::p',
                            //                 children: "{{'推荐的文章'}}",
                            //                 className: 'edfx-app-portal-header-right-help-title'
                            //             }, {
                            //                 name: 'help-title',
                            //                 component: '::ul',
                            //                 className: 'edfx-app-portal-header-right-help-subContent',
                            //                 children: [{
                            //                     name: 'content1',
                            //                     component: '::li',
                            //                     children: "{{'为什么修改密码后登录一直报错？'}}",
                            //                     className: 'edfx-app-portal-header-right-help-subContent-item'
                            //                 }, {
                            //                     name: 'content2',
                            //                     component: '::li',
                            //                     children: "{{'如何便捷管理多个账号？'}}",
                            //                     className: 'edfx-app-portal-header-right-help-subContent-item'
                            //                 }, {
                            //                     name: 'content3',
                            //                     component: '::li',
                            //                     children: "{{'如何修改绑定手机？'}}",
                            //                     className: 'edfx-app-portal-header-right-help-subContent-item'
                            //                 }],
                            //             }]
                            //         },]
                            //     },
                            // },  {
                            name: 'common',
                            component: 'Popover',
                            _visible: '{{!(data.appVersion == 114)}}',
                            overlayClassName: '{{data.other.isExpireStatus != 0 ? "popoverDown popoverDown_expire" : "popoverDown"}}',
                            // overlayClassName: 'headerRightMenu',
                            trigger: 'click',
                            visible: '{{data.userMenuVisible}}',
                            onVisibleChange: '{{$userVisibleChange}}',
                            style: { padding: '0px 10px' },
                            className: 'edfx-app-portal-header-right-menu',
                            placement: 'bottom',
                            content: {
                                name: 'menu',
                                component: 'Menu',
                                selectedKeys: '{{data.selectedKeys}}',
                                style: { width: '164.08px' },
                                onClick: '{{$topMenuClick}}',
                                children: [{
                                    name: 'Search',
                                    component: 'Menu.Item',
                                    key: 'mySetting',
                                    _visible: '{{data.headCtrl}}',
                                    className: 'edfx-app-portal-header-right-self-popover-item',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'edfx-app-portal-header-right-self-popover-item1',
                                        type: 'gerenshezhi',
                                    }, {
                                        name: 'messageName',
                                        component: '::span',
                                        className: 'headBarBtn',
                                        style: { marginLeft: '4px' },
                                        children: "{{'个人设置'}}"
                                    }]
                                    // }, {
                                    //     name: 'Search',
                                    //     component: 'Menu.Item',
                                    //     key: 'help',
                                    //     className: 'edfx-app-portal-header-right-self-popover-item',
                                    //     children: [{
                                    //         name: 'message',
                                    //         fontFamily: 'edficon',
                                    //         component: 'Icon',
                                    //         style: { fontSize: '24px', verticalAlign: 'middle' },
                                    //         className: 'edfx-app-portal-header-right-self-popover-item2',
                                    //         type: 'zaixianbangzhuxin',
                                    //     }, {
                                    //         name: 'messageName',
                                    //         component: '::span',
                                    //         className: 'headBarBtn',
                                    //         children: "{{'在线帮助'}}"
                                    //     }]
                                }, {
                                    name: 'helpDoc',
                                    component: 'Menu.Item',
                                    key: 'helpDoc',
                                    className: 'edfx-app-portal-header-right-self-popover-item',
                                    children: [{
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'edfx-app-portal-header-right-self-popover-item2',
                                        type: 'bangzhuzhongxin',
                                    }, {
                                        name: 'text',
                                        component: '::span',
                                        className: 'headBarBtn',
                                        style: { marginLeft: '4px' },
                                        children: "{{'帮助中心'}}"
                                    }]
                                }, {
                                    name: 'Search',
                                    component: 'Menu.Item',
                                    trigger: 'click',
                                    key: 'toggleColor',
                                    // _visible: '{{!(data.appVersion == 107 && sessionStorage["dzSource"] == 1)}}',
                                    _visible: false,
                                    className: 'edfx-app-portal-header-right-self-popover-item',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'edfx-app-portal-header-right-self-popover-item2',
                                        type: 'huanfu',
                                    }, {
                                        name: 'messageItem',
                                        component: '::span',
                                        className: 'headBarBtn',
                                        children: [{
                                            name: 'messageItem2',
                                            component: '::span',
                                            children: [{
                                                name: 'name',
                                                component: '::span',
                                                placement: 'bottom',
                                                title: '{{data.colors[_rowIndex].tip}}',
                                                onClick: '{{function(){{$toggleColor(data.colors[_rowIndex].color, "change")}}}}',
                                                className: 'edfx-app-portal-header-right-self-popover-item-toggleColor',
                                                style: { background: "{{data.colors[_rowIndex].color}}", display: 'inline-block', marginLeft: '4px' },
                                                _power: 'for in data.colors',

                                            }]
                                        }]
                                    }]
                                }, {
                                    name: 'newGuide',
                                    component: 'Menu.Item',
                                    key: 'newGuide',
                                    // _visible: '{{data.appVersion != 104}}',
                                    _visible: false,
                                    disabled: '{{data.other.isExpire}}',
                                    className: 'edfx-app-portal-header-right-self-popover-item',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'edfx-app-portal-header-right-self-popover-item2',
                                        type: 'xinshouyindao',
                                    }, {
                                        name: 'messageName',
                                        component: '::span',
                                        className: 'headBarBtn',
                                        style: { marginLeft: '4px' },
                                        children: "{{'新手引导'}}"
                                    }]
                                }, {
                                    name: 'Search',
                                    component: 'Menu.Item',
                                    key: 'logout',
                                    _visible: '{{!(data.appVersion == 107 && sessionStorage["dzSource"] == 1) && !(data.appVersion == 114)}}',
                                    className: 'edfx-app-portal-header-right-self-popover-item',
                                    // onClick: '{{$logout}}',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'edfx-app-portal-header-right-self-popover-item2',
                                        type: 'tuichu',
                                    }, {
                                        name: 'messageName',
                                        component: '::span',
                                        style: { marginLeft: '4px' },
                                        className: 'headBarBtn',
                                        children: "{{'退出'}}"
                                    }]
                                }]
                            },
                            children: {
                                name: 'internal2',
                                component: '::div',
                                className: 'basicInfo',
                                style: { margin: '0px 2px' },
                                children: [{
                                    name: 'icon1',
                                    component: '::img',
                                    //fontFamily: 'edficon',
                                    style: { width: '28px', verticalAlign: 'middle', margin: '-3px 5px', cursor: 'pointer', height: '28px' },
                                    src: '{{$getPhoto()}}'
                                    //type: 'yonghu'
                                }, {
                                    name: 'userName',
                                    component: '::span',
                                    className: 'userName',
                                    title: '{{$getUserNickName()}}',
                                    children: '{{$getUserNickName()}}'
                                }, {
                                    name: 'BugList',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    style: { fontSize: '22px', verticalAlign: 'middle', marginLeft: '5px', cursor: 'pointer' },
                                    type: 'xia'
                                }]
                            }

                        }]
                        // }, {
                        //     name: 'topSearch1',
                        //     component: '::span',
                        //     _visible: '{{data.headCtrl}}',
                        //     // className:"edfx-app-portal-header-right-headerSearch",
                        //     className: '{{data.isShowSearch ? "edfx-app-portal-header-right-headerSearch-show  edfx-app-portal-header-right-headerSearch" : "edfx-app-portal-header-right-headerSearch"}}',
                        //     children: [{
                        //         name: 'topSearchIcon',
                        //         component: 'Icon',
                        //         _visible: '{{!data.isShowSearch}}',
                        //         onClick: '{{function() {$searchVisibleToogle(true)}}}',
                        //         className: 'edfx-app-portal-header-right-org-menu-icon-menu',
                        //         type: 'sousuo',
                        //         style: { fontSize: '24px', verticalAlign: 'middle' },
                        //         fontFamily: 'edficon',
                        //     }, {
                        //         name: 'searchName',
                        //         component: '::span',
                        //         className: 'headBarBtn',
                        //         _visible: '{{!data.isShowSearch}}',
                        //         onClick: '{{function() {$searchVisibleToogle(true)}}}',
                        //         children: '搜索'
                        //     }, {
                        //         name: 'topSearchDiv',
                        //         component: '::div',
                        //         _visible: '{{data.isShowSearch}}',
                        //         className: '{{data.isShowSearch ? "edfx-app-portal-search-container edfx-app-portal-search-show animated slideInRight" : "edfx-app-portal-search-container animated fadeOutRight"}}',
                        //         onAnimationEnd: "{{$searchAnimationEnd}}",
                        //         children: [{
                        //             name: 'topSearchInput',
                        //             component: 'Input.Search',
                        //             datasign: 'searchInput',
                        //             onBlur: '{{function() {$searchHidden()}}}',
                        //             id: 'edfx-app-portal-search-id',
                        //             placeholder: '请输入编码／名称进行查询（需求待定）'
                        //         }]
                        //     }]
                    }]
                }
            ]
        }, {
            name: 'content',
            component: 'Layout',
            // className: 'edfx-app-portal-content',
            className: '{{data.other.isExpireStatus != 0 ? (data.isShowMenu ? "edfx-app-portal-content edfx-app-portal-content-isExpire" : "hideMenuAndTabs edfx-app-portal-content edfx-app-portal-content-isExpire") : (data.isShowMenu ? "edfx-app-portal-content" : "hideMenuAndTabs edfx-app-portal-content")}}',
            // componentDidMount: '{{$resize()}}',
            trigger: 'click',
            children: [{
                name: 'left',
                component: 'Layout',
                onMouseOver: "{{(data.width == false && data.currentMenuType==1) ?$onMenuMouseOver:''}}",
                //onMouseLeave:"{{}}",
                style: "{{data.width ? {width: '165px'}	: (data.currentMenuType==1 ? {width: '165px'} :{width:'100px'})}}",
                className: 'edfx-app-portal-content-left',
                _visible: '{{data.isShowMenu}}',
                //animated: true,
                trigger: 'click',
                children: [{
                    name: 'leftMenu',
                    style: { display: '{{data.currentMenuType==1?"block":""}}', height: '100%' },
                    // onMouseOver: "{{(data.width == true && data.currentMenuType==1) ?$onScrollMouseOver:''}}",
                    // onMouseLeave: "{{(data.width == true && data.currentMenuType==1) ?$onScrollMouseLeave:''}}",
                    // className: "{{data.currentMenuType==2?'leftmenu':data.width ? data.currentMenuStyle:'leftmenu2'}}",
                    className: "leftmenu2",
                    component: 'Layout',
                    children: [{
                        name: 'menu',
                        id: 'menucontainer',
                        component: 'Menu',
                        mode: "{{data.currentMenuType==1?'inline':'vertical'}}",
                        theme: 'light',
                        trigger: 'click',
                        //openKeys:[10],
                        // key: "{{data.menuMathRandom}}",
                        onOpenChange: "{{data.currentMenuType==1?$onOpenChange:''}}",
                        selectedKeys: "{{data.currentMenuType==1?data.selectedKeys:''}}",
                        //inlineCollapsed:"{{data.width ?false:true}}",
                        openKeys: "{{data.defaultOpenKeys}}",
                        getPopupContainer: '{{function(){return document.querySelector("#box")}}}',
                        onClick: '{{$menuClick}}',
                        children: '{{$getMenuChildren()}}'
                    }]
                }]
            }, {
                name: 'more',
                component: 'Layout',
                //className: "{{data.fold =='zhankai' ? (data.width ? '' : (data.currentMenuType==1 ? '' : 'contentRight menuPackup2')) :'divPadding contentRight'}}",
                style: "{{data.fold =='shouhui' ? {paddingLeft: '10px'} : {paddingLeft: '0px'}}}",
                children: [{
                    name: 'mainTop',
                    component: '::div',
                    className: 'mainTop',
                    _visible: '{{data.isTabsStyle}}',
                    children: [{
                        name: 'tabcontainer',
                        component: '::div',
                        className: 'tabcontainer',
                        children: {
                            name: 'tabs',
                            component: 'Tabs',
                            className: "edfx-app-portal-content-tabs",
                            type: "editable-card",
                            hideAdd: true,
                            activeKey: '{{data.content && data.content.name}}',
                            onChange: '{{$tabChange}}',
                            onEdit: '{{$tabEdit}}',
                            key: '{{data.mathRandom}}',
                            _visible: '{{ data.openTabs && data.openTabs.length > 0}}',
                            children: [{
                                name: 'tab1',
                                component: 'Tabs.TabPane',
                                closable: '{{data.openTabs[_rowIndex].name !== "我的桌面"}}',
                                key: '{{data.openTabs[_rowIndex].name}}',
                                tab: '{{data.openTabs[_rowIndex].name}}',
                                _power: 'for in data.openTabs'
                            }]
                        }
                    }, {
                        name: 'grsz',
                        component: '::a',
                        className: 'portalGrsz',
                        onClick: "{{$openMySet}}",
                        _visible: '{{data.appVersion == "110"}}',
                        children: '个人设置'

                    }, {
                        name: 'tapHandler',
                        component: 'Popover',
                        // popupClassName: '{{data.other.isExpireStatus != 0 ? (data.fold =="shouhui" ? "edfx-app-portal-list-popover tapHandlerzk" : "edfx-app-portal-list-popover") : (data.fold =="shouhui" ? "edfx-app-portal-list-popover tapHandler tapHandlerzk2" : "edfx-app-portal-list-popover tapHandler") }}',
                        popupClassName: 'edfx-app-portal-list-popover',
                        _visible: '{{data.openTabs.length >= 2 }}',
                        placement: 'bottom',
                        title: '',
                        content: {
                            name: 'menu',
                            component: 'Menu',
                            onClick: '{{$closeTabs}}',
                            children: [{
                                name: 'tempt',
                                component: 'Menu.Item',
                                key: 'current',
                                children: '关闭当前'
                            }, {
                                name: 'import',
                                component: 'Menu.Item',
                                key: 'all',
                                children: '关闭所有'
                            }]
                        },
                        trigger: 'hover',
                        children: {
                            name: 'filterSpan',
                            _visible: '{{data.openTabs.length >= 2 }}',
                            component: '::div',
                            className: 'edfx-app-portal-content-closeLink',
                            children: '关闭页签'
                        }
                    }, {
                        name: 'extraMenu',
                        component: '::div',
                        className: 'extraMenu',
                        style: '{{$getExtraMenuWidth()}}',
                        children: [{
                            name: 'conf',
                            component: '::div',
                            className: 'panelControl',
                            // _visible: '{{data.content && data.content.appName == "edfx-app-home"}}',
                            _visible: false,
                            onClick: '{{$showControlPanel}}',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'zhuomianpeizhi'
                            }, {
                                name: 'conf',
                                component: '::span',
                                children: '桌面配置'
                            }]
                        }, {
                            name: 'batch',
                            component: 'Dropdown',
                            trigger: 'click',
                            _visible: '{{$isDevMode()}}',
                            overlay: {
                                name: 'menu',
                                component: 'Menu',
                                onClick: '{{$batchMenuClick}}',
                                children: [{
                                    name: 'axure',
                                    component: 'Menu.Item',
                                    key: 'axure',
                                    children: '原型'
                                }, {
                                    name: 'dictionary',
                                    component: 'Menu.Item',
                                    key: 'dictionary',
                                    children: '数据字典'
                                }, {
                                    name: 'webapi',
                                    component: 'Menu.Item',
                                    key: 'webapi',
                                    children: 'web接口'
                                }, {
                                    name: 'ued',
                                    component: 'Menu.Item',
                                    key: 'ued',
                                    children: 'UED'
                                }, {
                                    name: 'jira',
                                    component: 'Menu.Item',
                                    key: 'jira',
                                    children: 'Jira'
                                }, {
                                    name: 'Jenkins',
                                    component: 'Menu.Item',
                                    key: 'Jenkins',
                                    children: 'Jenkins'
                                }, {
                                    name: 'k8s',
                                    component: 'Menu.Item',
                                    key: 'k8s',
                                    children: 'k8s'
                                }, {
                                    name: 'sonar',
                                    component: 'Menu.Item',
                                    key: 'sonar',
                                    children: 'sonar'
                                }, {
                                    name: 'deleteAccount',
                                    component: 'Menu.Item',
                                    key: 'deleteAccount',
                                    children: 'deleteAccount'
                                }]
                            },
                            children: {
                                name: 'internal',
                                component: '::div',
                                className: 'edfx-app-portal-content-apiLink',
                                children: ['开发管理', {
                                    name: 'BugList',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    style: { fontSize: '22px', verticalAlign: 'middle' },
                                    type: 'xia'
                                }]
                            }
                        }, {
                            name: 'zoom',
                            component: '::div',
                            className: 'panelControl',
                            children: [{
                                name: 'zoom',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                className: 'foldico',
                                type: "{{data.fold =='shouhui' ? 'shouhui': 'zhankai'}}",
                                title: "{{data.fold =='shouhui' ? '收缩' :'展开'}}",
                                onClick: '{{function(){$fold()}}}'
                            }]
                        }, {
                            name: 'panel',
                            className: 'configPanel',
                            component: '::div',
                            style: { display: "{{data.showControlPanel}}" },
                            children: [{
                                name: 'shade',
                                className: 'configPanel-shade',
                                component: '::div',
                                onClick: '{{function(){$hideCtrlPanel("cancel")}}}'
                            }, {
                                name: 'container',
                                component: '::div',
                                className: '{{data.panelAnimation == "in" ? "configPanel-container animated slideInRight" : "configPanel-container animated slideOutRight"}}',
                                onAnimationEnd: "{{$hidePanelEnd}}",
                                style: '{{data.other.isExpireStatus != 0 ? {top: "90px"} : {top: "54px"}}}',
                                children: [{
                                    name: 'title',
                                    component: '::div',
                                    className: 'configPanel-title',
                                    children: [{
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'peizhishouye'
                                    }, {
                                        name: 'text',
                                        component: '::span',
                                        children: '配置首页展示面板'
                                    }]
                                }, {
                                    name: 'main',
                                    className: 'configPanel-main',
                                    component: '::div',
                                    children: [{
                                        name: 'gl',
                                        component: '::div',
                                        children: [{
                                            name: 'title',
                                            className: 'configPanel-main-title',
                                            component: '::div',
                                            children: '财务'
                                        }, {
                                            name: 'options',
                                            className: 'configPanel-main-options',
                                            component: '::div',
                                            children: [{
                                                name: '{{data.desktopAppList[_rowIndex].appName}}',
                                                component: 'Checkbox',
                                                onChange: '{{function(e){$panelCheckChange(e, _rowIndex)}}}',
                                                checked: '{{data.desktopAppList[_rowIndex].checked}}',
                                                children: '{{data.desktopAppList[_rowIndex].name}}',
                                                _power: 'for in data.desktopAppList'
                                            }]
                                        }]
                                    }]
                                }, {
                                    name: 'btns',
                                    className: 'configPanel-btns',
                                    component: '::div',
                                    style: { position: 'relative', height: '80px' },
                                    children: {
                                        name: 'container',
                                        component: '::div',
                                        style: { position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
                                        children: [{
                                            name: 'btn1',
                                            component: 'Button',
                                            style: { width: '70px', height: '30px' },
                                            type: 'primary',
                                            children: '确定',
                                            onClick: '{{function(){$hideCtrlPanel("save")}}}'
                                        }, {
                                            name: 'btn2',
                                            component: 'Button',
                                            style: { width: '70px', height: '30px' },
                                            children: '取消',
                                            onClick: '{{function(){$hideCtrlPanel("cancel")}}}'
                                        }]
                                    }
                                }]
                            }]
                        }]
                    }]
                }, {
                    name: 'main',
                    component: 'Layout',
                    className: "edfx-app-portal-content-main",

                    _visible: '{{!!(data.content && data.content.appName)}}',
                    children: {
                        name: 'app',
                        component: 'AppLoader',
                        appName: '{{ data.openTabs && data.openTabs.length > 0 && data.openTabs[_rowIndex].appName }}',
                        onPortalReload: '{{$load}}',
                        setPortalContent: '{{$setContent}}',
                        deleteOpenTabsAppProps: '{{$deleteOpenTabsAppProps}}',
                        appVersion: "{{data.appVersion}}",
                        editing: "{{$editing}}",
                        updateOrgList: '{{$getOrgs}}',
                        hideHead: "{{function(){$setField('data.headCtrl', false)}}}",
                        reInitContent: "{{$reInitContent}}",
                        '...': '{{data.openTabs && data.openTabs.length > 0 && data.openTabs[_rowIndex].appProps}}',
                        isTabStyle: '{{data.isTabsStyle}}',
                        isExpire: '{{data.other.isExpire}}',
                        _notRender: '{{ !(data.content && data.content.name == data.openTabs[_rowIndex].name) }}',
                        // _visible: '{{ (data.content && data.content.name == data.openTabs[_rowIndex].name) }}',
                        _power: 'for in data.openTabs',
                        bsgztAccessTaxlist: '{{data.other.bsgztAccessTaxlist}}'
                    }
                }]
            }]
        }, {
            name: 'service',
            component: 'Movable',
            className: 'service',
            key: '{{data.service.mathRandom}}',
            _visible: '{{data.content && data.content.appName == "edfx-app-home"}}',
            // _visible: false,
            style: { width: '30px', height: '139px', color: '#ffffff', right: '0', bottom: '88px' },
            isStopX: true,
            children: [{
                name: 'handle',
                component: '::div',
                className: 'handle movable_handle',
                children: {
                    name: 'item',
                    component: 'Icon',
                    className: 'movable_handle',
                    fontFamily: 'edficon',
                    type: 'tuodong'
                }
            }, {
                name: 'customer',
                component: '::div',
                // onMouseOver: '{{$showCustomer}}',
                // onMouseLeave: '{{$hideCustomer}}',
                id: 'starConversation',
                className: 'onlineCustomer',
                children: [{
                    name: 'item',
                    component: '::div',
                    className: 'content closeCustomer',
                    children: '在线客服'
                }, {
                    name: 'icon',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'customerIcon',
                    type: 'zaixianbangzhu'
                }, {
                    name: 'item',
                    component: '::span',
                    className: 'content openCustomer',
                    children: '在线客服'
                }]
            }, {
                name: 'imchat',
                component: 'AppLoader',
                appName: 'ttk-edf-app-im',
                groupNo: '10341037',
                eno: 'anyone',
                thirdPartySession: '123'
            }, {
                name: 'weixin',
                component: '::div',
                className: 'weixin',
                style: { opacity: '{{data.service.qrcodeVisible ? "1" : "0.7"}}', filter: '{{data.service.qrcodeVisible ? "alpha(opacity=100)" : "alpha(opacity=70)"}}' },
                onMouseOver: '{{$showQrcode}}',
                onMouseLeave: '{{$hideQrcode}}',
                children: [{
                    name: 'item',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'weixin'
                }, {
                    name: 'qrcode',
                    component: '::div',
                    className: 'qrcode',
                    _visible: '{{data.service.qrcodeVisible}}',
                    children: {
                        name: 'item',
                        component: '::div',
                        className: 'container',
                        children: [{
                            name: 'img',
                            component: '::img',
                            src: '{{$getQrcode()}}',
                            className: 'qrcodeImg'
                        }, {
                            name: 'item',
                            component: '::div',
                            className: 'content',
                            children: '扫一扫关注公众号'
                        }]
                    }
                }]
            }, {
                name: 'loopLink',
                component: '::iframe',
                id: 'loopLink',
                _visible: false,
                //_visible: '{{data.other.bsgztAccess ==1?true:false}}',
                height: '0',
                width: '0',
                scrolling: 'no',
                frameborder: '0'
            }]
        }]
    }
}

export function getInitState() {
    let width = window.innerWidth > 1024 ? true : false
    let bsgztAccess = sessionStorage['thirdPartysourceType'] == 'bsgzt' ? 1 : 0
    let appInfo = sessionStorage['appInfo']
    let bsgztAccessTaxlist = (sessionStorage['thirdPartysourceType'] == 'bsgzt') &&
        (!!appInfo && (JSON.parse(appInfo).appName == 'ttk-taxapply-app-taxlist' || JSON.parse(appInfo).appName == 'ttk-scm-app-sa-invoice-list'))
        ? 1 : 0
    return {
        data: {
            // manageList: [],
            menu: [],
            selectCurrentMenu: '',
            // colors: [{color:'#FF913A',tip: '活力橙'}, {color:'#00B38A',tip:'荷叶绿'}, {color:'#0066B3',tip:'商务蓝'},{color:'#1EB5AD',tip:'薄荷蓝'}, {color:'#B4A074',tip:'淡雅棕'}, {color:'#414141',tip:'经典灰'}],
            colors: [{ color: '#FF913A', tip: '活力橙' }, { color: '#1EB5AD', tip: '薄荷蓝' }, { color: '#0066B3', tip: '商务蓝' }, { color: '#B4A074', tip: '淡雅棕' }],
            tips: ['1', '2', '3', '4', '5', '6'],
            menuSelectedKeys: [],
            menuDefaultOpenKeys: [10],
            defaultOpenKeys: [],
            content: {},
            openTabs: [],
            isTabsStyle: false,
            isShowMenu: false,
            other: {
                isExpire: true,
                isExpireText: '',
                isExpireStatus: 0,
                bsgztAccess, //办税工作台对接
                bsgztAccessTaxlist, //办税工作台对接申报不显示过期信息
            },
            width: width,
            widthPersonStatus: false,
            menuMathRandom: Math.random(),
            isShowSearch: false,
            animation: 'out',
            showPanel: 'none',
            visible: false,
            userMenuVisible: false,
            currentMenuStyle: 'nomenuscroll',
            currentMenuType: 1,
            menuType: [{
                id: 1,
                text: '树形菜单'
            }, {
                id: 2,
                text: '平铺菜单'
            }],
            selectedKeys: [],
            headCtrl: true,             //控制头部的显示
            mathRandom: 0,               //控制tab更新
            showControlPanel: 'none',
            panelAnimation: 'out',
            fold: 'zhankai',
            service: {
                qrcodeVisible: false,
                onlineCustomerState: true,
                mathRandom: Math.random()
            },
            msgNum: 0, //消息条数
            periodDate: {
                maxClosingPeriod: '',
                periodDate: moment()
            }, //日期期间
            appVersion: sessionStorage['appId'],
            org: {},
            logoImg:''
        }
    }
}
