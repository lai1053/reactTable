export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-yyhome-batch-declare',
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
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/sb/plsb_banner.jpg'
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
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/sb/plsb_block01.jpg'
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
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/sb/plsb_block02.jpg'
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
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/sb/animation_02.gif'
                    },
                ]
            },
            {
                name:'banner5',
                component:'::div',
                className:'module banner4',
                children:[
                    {
                        name: 'img',
                        component: '::img',
                        src: 'https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/sb/animation_01.gif'
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