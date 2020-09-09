import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-importdata-enterprise',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-gl-app-importdata-enterprise-top',
            children: [{
                name: 'barItem',
                component: '::div',
                className: 'ttk-gl-app-importdata-enterprise-top-bar',
                children: [{
                    name: 'step1',
                    component: '::div',
                    className: 'ttk-gl-app-importdata-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: 'ttk-gl-app-importdata-enterprise-top-bar-step-icon titlesuccess',
                        component: '::div',
                        children: '1'
                    }, {
                        name: 'description',
                        component: '::span',
                        className: 'ttk-gl-app-importdata-enterprise-top-bar-step-description descriptionsuccess',
                        children: '导入账套'
                    }]
                }, {
                    name: 'line1',
                    className: '{{data.content.step >= 2 ? "ttk-gl-app-importdata-enterprise-top-bar-line active" : "ttk-gl-app-importdata-enterprise-top-bar-line"}}',
                    component: '::span',
                }, {
                    name: 'step2',
                    component: '::div',
                    className: 'ttk-gl-app-importdata-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: '{{data.content.step>= 2 ? "ttk-gl-app-importdata-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-icon"}}',
                        component: '::div',
                        children: '2'
                    }, {
                        name: 'description',
                        component: '::span',
                        className: '{{data.content.step>=2 ? "ttk-gl-app-importdata-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-description"}}',
                        children: '数据导入'
                    }]
                },

                // {
                //     name: 'line2',
                //     className: '{{data.content.step >= 4 ? "ttk-gl-app-importdata-enterprise-top-bar-line active" : "ttk-gl-app-importdata-enterprise-top-bar-line"}}',
                //     component: '::span',
                // }, {
                //     name: 'step3',
                //     component: '::div',
                //     className: 'ttk-gl-app-importdata-enterprise-top-bar-step',
                //     children: [{
                //         name: 'title',
                //         className: '{{data.content.step>=4 ? "ttk-gl-app-importdata-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-icon"}}',
                //         component: '::div',
                //         children: '3'
                //     }, {
                //         name: 'description',
                //         component: '::span',
                //         className: '{{data.content.step>=4 ? "ttk-gl-app-importdata-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-description"}}',
                //         children: '资产确认'
                //     }]
                // },
                {
                    name: 'line3',
                    className: '{{data.content.step >= 5 ? "ttk-gl-app-importdata-enterprise-top-bar-line active" : "ttk-gl-app-importdata-enterprise-top-bar-line"}}',
                    component: '::span',
                }, {
                    name: 'step4',
                    component: '::div',
                    className: 'ttk-gl-app-importdata-enterprise-top-bar-step',
                    children: [{
                        name: 'title',
                        className: '{{data.content.step>=5 ? "ttk-gl-app-importdata-enterprise-top-bar-step-icon titlesuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-icon"}}',
                        component: '::div',
                        children: '3'
                    }, {
                        name: 'description',
                        component: '::span',
                        className: '{{data.content.step>=5 ? "ttk-gl-app-importdata-enterprise-top-bar-step-description descriptionsuccess":"ttk-gl-app-importdata-enterprise-top-bar-step-description"}}',
                        children: '导入完成'
                    }]
                }]
            }]
        }, {
            name: 'content',
            component: 'Layout',
            className: 'ttk-gl-app-importdata-enterprise-content',
            children: {
                name: 'app',
                component: 'AppLoader',
                appName: '{{data.content.appName}}',
                setPortalContent: '{{$setContent}}',
                editing: 'true',
                appVersion: '{{data.appVersion}}',
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
                name: '创建账套',
                appName: 'ttk-edf-app-manage-import',
                appProps: '',
                step: 1
            },
            other: {
                //说明：科目对照页面，需要导入基础档案（1-2） 然后在导入科目（2-3）最后在3的状态下处理科目对照映射，最后点击下一步进入资产卡片页面
                appList: [
                    { appName: 'ttk-edf-app-manage-import', step: 1, name: '创建账套' },
                    { appName: 'ttk-gl-app-importdata-accountrelation', step: 2, name: '数据导入' },
                    { appName: 'ttk-gl-app-importdata-accountrelation', step: 3, name: '数据导入' },
                    { appName: 'ttk-gl-app-asset-list', step: 4, name: '资产确认' },
                    { appName: 'ttk-gl-app-importdata-success', step: 5, name: '导入完成' }
                ]
            },
            stepContent: {
                step1InitData: {

                },
                step2InitData: {

                },
                step3InitData: {

                }
            }
        }
    }
}
