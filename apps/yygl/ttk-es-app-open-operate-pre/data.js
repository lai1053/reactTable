export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-open-operate-pre',
        children:[
            // {
            //     name:'button',
            //     component:'Button',
            //     onClick:'{{$goEs}}',
            //     children:'esssssssss'
            // },
            {
                name:'loading',
                component:'::div',
                _visible: '{{!data.isShow}}',
                className:'ttk-es-app-open-operate-pre-loading',
                children:[
                    {
                        name:'spin',
                        component:'Spin',
                        className:'ttk-es-app-open-operate-pre-loading-main',
                        tip:'加载中'
                    }
                ]
            },
            {
                name: 'main',
                component: '::div',
                _visible: '{{data.isShow}}',
                className:'ttk-es-app-open-operate-pre-main',
                children: {
                    name: 'app',
                    component: 'AppLoader',
                    appName: '{{ data.appName }}',
                    isRefresh: false,
                    appVersion: "{{data.appVersion}}"
                }
            }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            appName:'ttk-es-app-open-operate',
            isShow:false
        }
    }
}