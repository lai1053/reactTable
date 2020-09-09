export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-yyhome-batch-signature',
        // children:'{{$renderChildren}}'
        children:[
            {
                name:'banner1',
                component:'::div',
                className:'module banner',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/banner_01.jpg'
                    },
                ]
            },
            {
                name:'banner2',
                component:'::div',
                className:'module',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/block_02.jpg'
                    },
                ]
            },
            {
                name:'banner3',
                component:'::div',
                className:'module',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/block_03.jpg'
                    },
                ]
            },
            {
                name:'banner4',
                component:'::div',
                className:'module',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/block_04.jpg'
                    },
                ]
            },
            {
                name:'banner5',
                component:'::div',
                className:'module',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/block_05.jpg'
                    },
                ]
            },
            {
                name:'banner6',
                component:'::div',
                className:'module',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/animation_02.gif'
                    },
                ]
            },
            {
                name:'banner7',
                component:'::div',
                className:'module banner6',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fp/animation_01.gif'
                    },
                ]
            }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            finalNum:0,
            allNum:0,
            progressValue:55,
            downloads:[],
            statusType:{
                '1':'下载成功',
                '2':'下载失败',
                '3':'下载中',
            }
        }
    }
}