// import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-financeinit-enterprise',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-gl-app-financeinit-enterprise-top',
            children: [{
                name: 'barItem',
                component: '::div',
                className: 'ttk-gl-app-financeinit-enterprise-top-bar',
                children: [{
                    name: 'step1',
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: 'ttk-gl-app-financeinit-enterprise-top-bar-step-icon titlesuccess',
                        component: '::div',
                        children: '1'
                    }, {
                        name: 'description',
                        component: '::span',
                        className: 'ttk-gl-app-financeinit-enterprise-top-bar-step-description descriptionsuccess',
                        children: '上传数据'
                    }]
                }, {
                    name: 'line1',
                    className: '{{data.content.step >= 2 ? "ttk-gl-app-financeinit-enterprise-top-bar-line active" : "ttk-gl-app-financeinit-enterprise-top-bar-line"}}',
                    component: '::span',
                }, {
                    name: 'step2',
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: '{{data.content.step>= 2 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-icon"}}',
                        component: '::div',
                        children: '2'
                    }, {
                        name: 'description',
                        component: '::span',                       
                        className: '{{data.content.step>=2 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-description"}}',
                        children: '科目初始化'
                    }]
                }, {
                    name: 'line2',
                    className: '{{data.content.step >= 3 ? "ttk-gl-app-financeinit-enterprise-top-bar-line active" : "ttk-gl-app-financeinit-enterprise-top-bar-line"}}',
                    component: '::span',
                }, {
                    name: 'step3',
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: '{{data.content.step>=3 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-icon"}}',
                        component: '::div',
                        children: '3'
                    }, {
                        name: 'description',
                        component: '::span',                        
                        className: '{{data.content.step>=3 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-description"}}',
                        children: '期初数据维护'
                    }]
                }, {
                    name: 'line3',
                    className: '{{data.content.step >= 4 ? "ttk-gl-app-financeinit-enterprise-top-bar-line active" : "ttk-gl-app-financeinit-enterprise-top-bar-line"}}',
                    component: '::span',
                }, {
                    name: 'step4',
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: '{{data.content.step>=4 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-icon"}}',
                        component: '::div',
                        children: '4'
                    }, {
                        name: 'description',
                        component: '::span',
                        className: '{{data.content.step>=4 ? "ttk-gl-app-financeinit-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-financeinit-enterprise-top-bar-step-description"}}',
                        children: '完成'
                    }]
                }]
            }]
        }, {
            name: 'content',
            component: 'Layout',
            className: 'ttk-gl-app-financeinit-enterprise-content',
            children: {
                name: 'app',
                component: 'AppLoader',                
                appName: '{{data.content.appName}}',
                // onPortalReload: '{{$load}}',
                setPortalContent: '{{$setContent}}',
                editing: 'true',
                appExtendParams: '{{data.content.appProps}}',                            
                reInitContent: "{{$reInitContent}}"
            }
        }]
    }
}

export function getInitState() {
    return {
        data: {
            content: {
                name: '上传数据',
                appName: 'ttk-gl-app-financeinit-uploaddata',
                appProps: '',
                editing: false,
                step: 1,
                stepstatu: 'process'
            },
            other: {
                appList: [
                    { appName: 'ttk-gl-app-financeinit-uploaddata', step: 1,name:'上传数据' },
                    { appName: 'app-account-subjects-financeinit', step: 2, name: '科目'},
                    { appName: 'ttk-gl-app-finance-periodbegin', step: 3, name: '财务期初'},
                    { appName: 'ttk-gl-app-financeinit-success', step: 4, name: '完成'}
                ]
            },
            stepContent: {
                step1InitData: {

                },
                step2InitData: {

                },
                step3InitData: {

                },
                step4InitData: {

                }
            }
        }
    }
}