export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-fastAuthentication',
        children: [{
            name: 'demo',
            component: '::div',
            className: 'inv-app-fastAuthentication-upSecretKey',
            children: [
                {
                    name: '秘钥上传',
                    component: '::div',
                    _visible: "{{data.show.demo === '1'}}",
                    children: [
                        {
                            name: 'upSecretKey',
                            component: '::div',
                            className: 'inv-app-fastAuthentication-upSecretKeyContent',
                            onClick: '{{$upSecretKey}}',
                            children: ''
                        },
                        {
                            name: 'span',
                            component: '::span',
                            className: 'inv-app-fastAuthentication-upSecretKeyContent-span12',
                            children: [
                                {
                                    name: 'span1',
                                    component: '::span',
                                    className: 'inv-app-fastAuthentication-upSecretKeyContent-span11',
                                    children: '提示：'
                                },
                                {
                                    name: 'span2',
                                    component: '::span',
                                    className: 'inv-app-fastAuthentication-upSecretKeyContent-span22',
                                    children: '快速认证同扫描认证，本月认证只能下月申报抵扣，与本期是否申报无关。'
                                }
                            ]
                        }
                    ]
                },
                {
                    name: '列表显示',
                    component: 'AppLoader',
                    appName: 'inv-app-fastAuthentication-list',
                    _visible: "{{data.show.demo === '2'}}",
                }
            ]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            show: {
                demo: '2'
            },
        }
    }
}