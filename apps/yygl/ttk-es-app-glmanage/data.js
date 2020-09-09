import moment from 'moment'
export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-es-app-glmanage',
        children: [
        {
            name: 'content',
            component: 'Layout',
            className: 'ttk-es-app-glmanage-content',
            trigger: 'click',
            children: [{
                name: 'left',
                component: 'Layout',
                onMouseOver: "{{(data.width == false && data.currentMenuType==1) ?$onMenuMouseOver:''}}",
                style: "{{data.width ? {width: '165px'}	: (data.currentMenuType==1 ? {width: '165px'} :{width:'100px'})}}",
                className: 'ttk-es-app-glmanage-content-left',
                _visible: '{{data.isShowMenu}}',
                trigger: 'click',
                children: [{
                    name: 'leftMenu',
                    style: { display: '{{data.currentMenuType==1?"block":""}}', height: '100%' },
                    onMouseOver: "{{(data.width == true && data.currentMenuType==1) ?$onScrollMouseOver:''}}",
                    onMouseLeave: "{{(data.width == true && data.currentMenuType==1) ?$onScrollMouseLeave:''}}",
                    className: "{{data.currentMenuType==2?'leftmenu':data.width ? data.currentMenuStyle:'leftmenu2'}}",
                    component: 'Layout',
                    children: [{
                        name: 'menu',
                        id: 'menucontainer',
                        component: 'Menu',
                        mode: "{{data.currentMenuType==1?'inline':'vertical'}}",
                        theme: 'light',
                        trigger: 'click',
                        onOpenChange: "{{data.currentMenuType==1?$onOpenChange:''}}",
                        selectedKeys: "{{data.currentMenuType==1?data.selectedKeys:''}}",
                        defaultSelectedKeys:'{{data.defaultSelectedKeys}}',
                        defaultOpenKeys: "{{data.defaultOpenKeys}}",
                        getPopupContainer: '{{function(){return document.querySelector("#box")}}}',
                        onClick: '{{$menuClick}}',
                        children: '{{$getMenuChildren()}}'
                    }]
                }]
            }, {
                name: 'more',
                component: 'Layout',
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
                            className: "{{data.openTabs.length >= 2 ? 'ttk-es-app-glmanage-content-tabs showLast': 'hideLast ttk-es-app-glmanage-content-tabs'}}",
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
                            }, {
                                name: 'more',
                                component: 'Tabs.TabPane',
                                closable: false,
                                key: 'more',
                                tab: {
                                    name: 'arrowdown',
                                    component: 'Dropdown',
                                    trigger: 'click',
                                    overlay: {
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
                                    children: {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        style: { fontSize: '20px' },
                                        type: 'xia'
                                    }
                                }
                            }]
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
                                }]
                            }]
                        }]
                    }]
                }, {
                    name: 'main',
                    component: 'Layout',
                    className: "ttk-es-app-glmanage-content-main",
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
                        // isExpire: '{{data.other.isExpire}}',
                        _notRender: '{{ !(data.content && data.content.name == data.openTabs[_rowIndex].name) }}',
                        _power: 'for in data.openTabs',
                        bsgztAccessTaxlist: '{{data.other.bsgztAccessTaxlist}}'
                    }
                }]
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
            defaultSelectedKeys: ['20000'],
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
            selectedKeys: ['20000'],
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
            appVersion: sessionStorage['appId']
        }
    }
}
