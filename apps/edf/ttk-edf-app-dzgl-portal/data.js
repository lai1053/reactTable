import moment from 'moment'
import toolBox from './img/toolbox.png'
import info from './img/info.png'
import tool1 from './img/tool1.png'
import tool2 from './img/tool2.png'
import tool3 from './img/tool3.png'
import defaultImg from './img/defaultImg.png'
export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: "ttk-edf-app-dzgl-portal",
        children: [{
            name: 'topTab',
            component: '::div',
            children: [{
                name: 'top1',
                component: '::div',
                className: 'ttk-edf-app-dzgl-portal-header-top1',
                children: [{
                    name: 'globalTab',
                    component: 'Tabs',
                    hideAdd: true,
                    type: "editable-card",
                    className: 'globalTab',
                    activeKey: '{{data.currentIndex}}',
                    // onChange: '{{$globalTabChange}}',
                    onChange: '{{function(activeKey){setTimeout(function(){$globalTabChange(activeKey)},500)}}}',
                    onEdit: '{{$globalTabEdit}}',
                    _visible: '{{ data.globalTabs && data.globalTabs.length > 0}}',
                    children: [{
                        name: 'tab',
                        component: 'Tabs.TabPane',
                        closable: '{{data.globalTabs[_rowIndex].closable}}',
                        key: '{{data.globalTabs[_rowIndex].key}}',
                        tab: {
                            name: 'tabText',
                            component: '::span',
                            children: '{{data.globalTabs[_rowIndex].name}}',
                        },
                        _power: 'for in data.globalTabs'
                    }, {
                        name: 'index0',
                        component: 'Tabs.TabPane',
                        closable: false,
                        clssName: 'test',
                        key: 'add',
                        tab: {
                            name: 'addBdzOrgList',
                            component: 'Popover',
                            overlayClassName: 'bdzOrgList',
                            trigger: 'click',
                            placement: 'bottom',
                            visible: '{{!data.extra && data.visible}}',
                            onVisibleChange: '{{$handleVisibleChange}}',
                            content: [{
                                name: 'itemSearch',
                                component: 'Input.Search',
                                style: { padding: '3px 5px', borderBottom: '1px solid rgb(228, 228, 228)' },
                                className: 'edfx-app-portal-header-right-menu-deptSearch',
                                placeholder: '搜索企业',
                                onChange: '{{function(e){$manageListShow(e.target.value)}}}'
                            }, {
                                name: 'menu',
                                component: 'Menu',
                                onClick: '{{$esOrgSelect}}',
                                children: [{
                                    name: 'item',
                                    component: 'Menu.Item',
                                    title: '{{data.manageListShow[_rowIndex].name}}',
                                    children: '{{data.manageListShow[_rowIndex].name}}',
                                    key: '{{data.manageListShow[_rowIndex].id}}',
                                    _power: 'for in data.manageListShow'
                                }]
                            }],
                            children: {
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'gaojichaxunlidejia',
                            }
                        }
                    }]
                }, {
                    name: 'bar',
                    component: '::div',
                    className: 'ttk-edf-app-dzgl-portal-header-top1-bar',
                    children: [{
                        name: 'rightDiv',
                        component: '::div',
                        className: 'ttk-edf-app-dzgl-portal-search-rightDiv',
                        children: [{
                            name: 'toolBox',
                            component: '::div',
                            style: {cursor: 'pointer', paddingRight:'12px', paddingLeft: '12px'},
                            onClick: '{{$openToolBox}}',
                            children: {
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'xdzgongjuxiang',
                                style: {paddingTop: '8px', width: '14px'},
                            }
                        }, {
                            name: 'message',
                            // _visible: '{{data.headCtrl}}',
                            _visible: false,
                            component: '::span',
                            className: 'ttk-edf-app-dzgl-portal-header-right-headerhelp headerMenuMessage',
                            style: { lineHeight: '50px', cursor: 'pointer' },
                            onClick: '{{function() {$sf("data.showTop3", false);$setContent("消息", "ttk-edf-app-message")}}}',
                            children: [{
                                name: 'img',
                                component: '::img',
                                style: {width: '14px'},
                                src: info
                            }, {
                                name: 'num',
                                component: '::span',
                                _visible: '{{data.msgNum <= 0 ? false : true}}',
                                className: 'msgNum',
                                children: '{{data.msgNum}}'
                            }]
                        }
                        //{
                        //     name: 'imcenter',
                        //     component: '::span',
                        //     id: 'starConversation',
                        //     className: 'ttk-edf-app-dzgl-portal-header-right-headerhelp',
                        //     style: { lineHeight: '56px', cursor: 'pointer' },
                        //     onClick: '{{$openIMCenter}}',
                        //     children: [{
                        //         name: 'icon',
                        //         component: 'Icon',
                        //         fontFamily: 'edficon',
                        //         style: { fontSize: '24px', verticalAlign: 'middle' },
                        //         type: 'zaixianfuwu'
                        //     }, {
                        //         name: 'word',
                        //         component: '::span',
                        //         children: '在线客服'
                        //     }]
                        // }
                        , {
                            name: 'common',
                            component: 'Popover',
                            overlayClassName: 'popoverDown popoverDown-setting',
                            overlayStyle: { width: '220px' },
                            // overlayClassName: 'headerRightMenu',
                            trigger: 'click',
                            // placement: 'bottomRight',
                            visible: '{{data.userMenuVisible}}',
                            onVisibleChange: '{{$userVisibleChange}}',
                            style: { padding: '0px 10px' },
                            className: 'ttk-edf-app-dzgl-portal-header-right-menu mySettingMenu',
                            placement: 'bottomRight',
                            content: {
                                name: 'menu',
                                component: 'Menu',
                                selectedKeys: '{{data.selectedKeys}}',
                                onClick: '{{$topMenuClick}}',
                                children: [{
                                    name: 'Search',
                                    component: 'Menu.Item',
                                    key: 'mySetting',
                                    _visible: '{{data.headCtrl}}',
                                    className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item1',
                                        type: 'jichushezhi',
                                    }, {
                                        name: 'messageName',
                                        component: '::span',
                                        className: 'headBarBtn',
                                        style: { marginLeft: '4px' },
                                        children: "{{'个人设置'}}"
                                    }]
                                },
                                // {
                                //     name: 'Personal',
                                //     component: 'Menu.Item',
                                //     _visible:false,
                                //     key: 'personal',
                                //     className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item toggleColor',
                                //     // onClick: '{{$logout}}',
                                //     children: [{
                                //         name: 'p1',
                                //         component: 'Icon',
                                //         fontFamily: 'edficon',
                                //         style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                //         className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item2',
                                //         type: 'huanfu',
                                //     }, {
                                //         name: 'p2',
                                //         component: '::span',
                                //         style: { marginLeft: '4px' },
                                //         className: 'headBarBtn',
                                //         //children: "{{'个性化'}}"
                                //         children: {
                                //             name: 'skin1',
                                //             component: "::a",
                                //             onClick: '{{function(){{$toggleColorItem(data.colorList[_rowIndex].background,"change")}}}}',
                                //             title: '{{ data.colorList[_rowIndex].name }}',
                                //             className: '{{ data.colorList[_rowIndex].right ? "skinBtns right" : "skinBtns" }}',
                                //             style: '{{ $getPortalStyle("background", data.colorList[_rowIndex].background) }}',
                                //             children: [{
                                //                 name: 'skin1title',
                                //                 component: '::p',
                                //                 style: '{{ $getPortalStyle("color", data.colorList[_rowIndex].color) }}',
                                //                 //children: '{{data.colorList[_rowIndex].name}}',
                                //                 children: ''
                                //             }, {
                                //                 name: 'icon',
                                //                 component: 'Icon',
                                //                 visible: '{{data.color==data.colorList[_rowIndex].background}}',
                                //                 fontFamily: 'edficon',
                                //                 className: 'btn-icon',
                                //                 type: 'duigou',
                                //             }],
                                //             _power: 'for in data.colorList'
                                //         }
                                //     }]
                                // },
                                 {
                                    name: 'Exit',
                                    component: 'Menu.Item',
                                    key: 'logout',
                                    className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item',
                                    // onClick: '{{$logout}}',
                                    children: [{
                                        name: 'message',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '24px', verticalAlign: 'middle', margin: '0px 2px' },
                                        className: 'ttk-edf-app-dzgl-portal-header-right-self-popover-item2',
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
                                style: { margin: '0px' },
                                children: [{
                                    name: 'icon1',
                                    component: '::img',
                                    //fontFamily: 'edficon',
                                    style: { width: '28px', verticalAlign: 'middle', margin: '-3px 5px', cursor: 'pointer', height: '28px',borderRadius:'50%' },
                                    // src: '{{$getPhoto()}}'
                                    src: '{{data.imgAccessUrl}}'
                                    //type: 'yonghu'
                                }, {
                                    name: 'BugList',
                                    component: 'Icon',
                                    fontFamily: 'edficon',
                                    style: { fontSize: '28px', verticalAlign: 'middle', marginLeft: '1px', cursor: 'pointer' },
                                    type: 'bumenrenyuanxialakai'
                                }]
                            }
                        }]
                    }]
                }, {
                    name: 'extra',
                    component: '::div',
                    className: 'extraBtn',
                    style:'{{data.extra ? {display: "block"} : {display: "none"}}}',
                    onClick: '{{function() {$globalTabChange("add")}}}',
                    children: {
                        name: 'addBdzOrgList',
                        component: 'Popover',
                        overlayClassName: 'bdzOrgList',
                        trigger: 'click',
                        placement: 'bottom',
                        visible: '{{data.extra && data.visible}}',
                        onVisibleChange: '{{$handleVisibleChange}}',
                        content: [{
                            name: 'itemSearch',
                            component: 'Input.Search',
                            style: { padding: '3px 5px', borderBottom: '1px solid rgb(228, 228, 228)' },
                            className: 'edfx-app-portal-header-right-menu-deptSearch',
                            placeholder: '搜索企业',
                            onChange: '{{function(e){$manageListShow(e.target.value)}}}'
                        }, {
                            name: 'menu',
                            component: 'Menu',
                            onClick: '{{$esOrgSelect}}',
                            children: [{
                                name: 'item',
                                component: 'Menu.Item',
                                title: '{{data.manageListShow[_rowIndex].name}}',
                                children: '{{data.manageListShow[_rowIndex].name}}',
                                key: '{{data.manageListShow[_rowIndex].id}}',
                                _power: 'for in data.manageListShow'
                            }]
                        }],
                        children: {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'gaojichaxunlidejia',
                        }
                    }
                }]
            }, {
                name: 'top3',
                component: '::div',
                _visible: '{{data.showTop3}}',
                children: [{
                    name: 'mask',
                    component: '::div',
                    onClick: '{{function() {$sf("data.showTop3", false)}}}',
                    className: 'ant-modal-mask dzgl',
                }, {
                    name: 'con',
                    component: '::div',
                    // onClick: '{{function() {$sf("data.showTop3", false)}}}',
                    className: 'ttk-edf-app-dzgl-portal-header-top3',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'ttk-edf-app-dzgl-portal-header-top3-title',
                        children: '税务工具'
                    }, {
                        name: 'con',
                        component: '::div',
                        className: 'ttk-edf-app-dzgl-portal-header-top3-con',
                        children: [{
                            name: 'con1',
                            component: '::div',
                            children: [{
                                name: 'left',
                                component: '::div',
                                className: 'ttk-edf-app-dzgl-portal-header-top3-con-left',
                                children: {
                                    name: 'img',
                                    component: '::img',
                                    src: tool1
                                }
                            }, {
                                name: 'right',
                                component: '::div',
                                children: [{
                                    name: "p1",
                                    component: "::a",
                                    target: "_blank",
                                    style: {color: '#333', lineHeight: '18px', fontSize: '14px'},
                                    href: 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E8%BF%9C%E7%A8%8B%E5%8B%BE%E9%80%89%E8%AE%A4%E8%AF%81%E5%AE%89%E8%A3%85%E7%A8%8B%E5%BA%8F.exe',
                                    children: '勾选认证工具'
                                }, {
                                    name:'p2',
                                    component: '::p',
                                    style: {color: '#a9a9a9',lineHeight: '28px', fontSize: '14px'},
                                    children: '勾选认证工具'
                                }]
                            }]
                        }, {
                            name: 'con2',
                            component: '::div',
                            children: [{
                                name: 'left',
                                component: '::div',
                                className: 'ttk-edf-app-dzgl-portal-header-top3-con-left',
                                children: {
                                    name: 'img',
                                    component: '::img',
                                    src: tool2
                                }
                            }, {
                                name: 'right',
                                component: '::div',
                                children: [{
                                    name: "p1",
                                    component: "::a",
                                    target: "_blank",
                                    style: {color: '#333', lineHeight: '18px', fontSize: '14px'},
                                    href: 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E8%B4%A2%E5%8A%A1%E8%B4%A6%E5%A5%97%E9%93%BE%E6%8E%A5%E5%B7%A5%E5%85%B7.exe',
                                    children: '账套连接工具'
                                }, {
                                    name:'p2',
                                    component: '::p',
                                    style: {color: '#a9a9a9',lineHeight: '28px', fontSize: '14px'},
                                    children: '账套连接工具'
                                }]
                            }]
                        }, {
                            name: 'con3',
                            component: '::div',
                            children: [{
                                name: 'left',
                                component: '::div',
                                className: 'ttk-edf-app-dzgl-portal-header-top3-con-left',
                                children: {
                                    name: 'img',
                                    component: '::img',
                                    src: tool3
                                }
                            }, {
                                name: 'right',
                                component: '::div',
                                children: [{
                                    name: "p1",
                                    component: "::a",
                                    target: "_blank",
                                    style: {color: '#333', lineHeight: '18px', fontSize: '14px'},
                                    href: 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E8%B4%A2%E5%8A%A1%E6%95%B0%E6%8D%AE%E6%99%BA%E8%83%BD%E5%90%88%E8%A7%84%E8%BD%AC%E6%8D%A2%E5%B7%A5%E5%85%B7.exe',
                                    children: '导账工具'
                                }, {
                                    name:'p2',
                                    component: '::p',
                                    style: {color: '#a9a9a9',lineHeight: '28px', fontSize: '14px'},
                                    children: '导账工具'
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }, {
            name: 'header',
            component: 'Layout',
            className: 'ttk-edf-app-dzgl-portal-header',
            _visible: '{{data.currentIndex === "0"}}',
            children: [{
                name: 'top2',
                component: '::div',
                className: 'ttk-edf-app-dzgl-portal-header-top2',
                children: [{
                    name: 'logoContainer',
                    component: '::div',
                    className: '{{data.width ? "ttk-edf-app-dzgl-portal-header-left" : "ttk-edf-app-dzgl-portal-header-left type2"}}',
                    children: [{
                        name: 'logo',
                        component: '::img',
                        className: 'ttk-edf-app-dzgl-portal-header-left-logo',
                        src: "{{data.logoImg ? data.logoImg : './vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_erp.png'}}"
                    }]
                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'ttk-edf-app-dzgl-portal-header-right',
                    children: [{
                        name: 'mainTop',
                        component: '::div',
                        className: 'mainTop',
                        // style:{width: '50%',float:'left'},
                        children: [{
                            name: 'tabcontainer',
                            component: '::div',
                            className: 'tabcontainer',
                            children: {
                                name: 'menu',
                                id: 'menucontainer',
                                component: 'Menu',
                                // mode: "{{data.currentMenuType==1?'inline':'vertical'}}",
                                theme: 'light',
                                trigger: 'click',
                                key: "{{data.menuMathRandom}}",
                                mode: 'horizontal',
                                onOpenChange: "{{data.currentMenuType==1?$onOpenChange:''}}",
                                // selectedKeys: "{{data.currentMenuType==1?data.selectedKeys:''}}",
                                deleteOpenKeys: '{{!data.width}}',
                                openKeys: '{{data.defaultOpenKeys}}',
                                // defaultOpenKeys: "{{data.defaultOpenKeys}}",
                                getPopupContainer: '{{function(){return document.querySelector("#box")}}}',
                                onClick: '{{$menuClick}}',
                                children: '{{$getMenuChildren()}}'
                            }
                        }]
                    }, {
                        name: 'companyName',
                        component: '::div',
                        className: 'ttk-edf-app-dzgl-portal-header-top2-right',
                        onClick: '{{function(){$sf("data.dljgVisible", true)}}}',
                        children: [{
                            name: 'addBdzOrgList',
                            component: 'Popover',
                            overlayClassName: 'bdzOrgList',
                            trigger: 'click',
                            placement: 'bottomRight',
                            visible: '{{data.dljgVisible}}',
                            onVisibleChange: '{{$handleDljgVisibleChange}}',
                            content: [{
                                name: 'menu',
                                component: 'Menu',
                                onClick: '{{$dljgOrgSelect}}',
                                children: [{
                                    name: 'item',
                                    component: 'Menu.Item',
                                    title: '{{data.dljgListShow[_rowIndex].name}}',
                                    children: '{{data.dljgListShow[_rowIndex].name}}',
                                    key: '{{data.dljgListShow[_rowIndex].id}}',
                                    _power: 'for in data.dljgListShow'
                                }]
                            }],
                            children: [{
                                name: 'text',
                                component: '::span',
                                children: '{{$getOrgName()}}'
                            }, {
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'xdzqiehuan'
                            }]
                        }]
                    }]
                }]
            }]
        }, {
            name: 'content',
            component: '::div',
            className: "ttk-edf-app-dzgl-portal-content",
            style: '{{data.currentIndex === "0" ? {top: "84px"} : {top: "30px"}}}',
            children: [{
                name: 'main',
                component: '::div',
                _visible: '{{!!(data.content && data.content.appName)}}',
                children: {
                    name: 'app',
                    component: 'AppLoader',
                    appName: '{{ data.globalTabs && data.globalTabs.length > 0 && data.globalTabs[_rowIndex].appName }}',
                    '...': '{{data.globalTabs && data.globalTabs.length > 0 && data.globalTabs[_rowIndex].params}}',
                    _notRender: '{{$renderCondition(data.globalTabs[_rowIndex])}}',
                    isRefresh: '{{data.globalTabs[_rowIndex].refresh || false}}',
                    appVersion: "{{data.appVersion}}",
                    _power: 'for in data.globalTabs',
                }
            }]
        }]
    }
}

export function getInitState() {
    let width = window.innerWidth > 1024 ? true : false
    let appLogo = localStorage.getItem('logo') || 'logo_erp.png'
    return {
        data: {
            // manageList: [],
            imgAccessUrl: defaultImg,
            menu: [],
            type: 'T',
            selectCurrentMenu: '',
            // colors: [{color:'#FF913A',tip: '活力橙'}, {color:'#00B38A',tip:'荷叶绿'}, {color:'#0066B3',tip:'商务蓝'},{color:'#1EB5AD',tip:'薄荷蓝'}, {color:'#38465C',tip:'淡雅棕'}, {color:'#414141',tip:'经典灰'}],
            colors: [{ color: '#FF913A', tip: '活力橙' }, { color: '#1EB5AD', tip: '薄荷蓝' }, { color: '#0066B3', tip: '商务蓝' }, { color: '#38465C', tip: '淡雅棕' }],
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
                menusearch: ''
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
            selectedKeys: ['60'],
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
            appLogo,
            appVersion: sessionStorage['appId'],
            color: '#058BB3',
            colorList: [{
                name: '紫罗兰(默认)',
                background: '#058BB3',
                color: '#531DAB',
                right: true
            }, {
                name: '商务蓝',
                background: '#0066B3',
                color: '#054F87'
            }, {
                name: '淡雅棕',
                background: '#B4A074',
                color: '#927D4E',
                right: true
            }, {
                name: '薄荷绿',
                background: '#1EB5AD',
                color: '#D6750D'
            }, {
                name: '藏蓝',
                background: '#222E47',
                color: '#3E527C'
            }, {
                name: '浪漫紫',
                background: '#5046A1',
                color: '#ffffff'
            }, {
                name: '健康绿',
                background: '#189977',
                color: '#10785D'
            }, {
                name: '奔放粉',
                background: '#E978AD',
                color: '#D05690'
            }, {
                name: '活力橙',
                background: '#FF913A',
                color: '#D6750D'
            }, {
                name: '深灰',
                background: '#3A3A3A',
                color: '#D6750D'
            }],
            toolBox,
            showTop3: false,
            //xdz
            currentIndex: "0",
            globalTabs: [{
                closable: false,
                key: '0',
                name: '首页',
                token: sessionStorage.getItem('_accessToken'),
                appName: 'ttk-es-app-yyhome',
                params: {address: 'index', dzgl: true}
            }],
            extra: false,
            dljgVisible: false,             //代理机构列表显示隐藏
            logoImg:''
        }
    }
}
