export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer-download-progress',
        children:[
            {
                name:'progress',
                component:'::div',
                className:'ttk-es-app-customer-download-progress-div',
                children:[
                    {
                        name:'bar',
                        className:'ttk-es-app-customer-download-progress-div-bar',
                        component: 'Progress',
                        percent: '{{data.progressValue}}',
                        strokeWidth:16,
                        status:'active',
                        showInfo: false
                    },
                    {
                        name:'progress',
                        component:'::div',
                        className:'{{data.progressValue<45?"ttk-es-app-customer-download-progress-div-value-half":"ttk-es-app-customer-download-progress-div-value"}}',
                        children:'{{data.finalNum + "/" + data.allNum}}'
                    }
                ]
            },
            {
                name:'list',
                component:'::div',
                className:'ttk-es-app-customer-download-progress-list',
                children:[
                    {
                        name:'item',
                        component:'::div',
                        className:'ttk-es-app-customer-download-progress-list-item',
                        children:[
                            {
                                name:'name',
                                component:'::div',
                                className:'ttk-es-app-customer-download-progress-list-item-name',
                                children:'{{data.downloads[_rowIndex].customer+"："}}'
                            },
                            {
                                name: 'popover',
                                component: 'Popover',
                                popupClassName: 'ttk-es-app-customer-download-progress-popover',
                                placement: 'bottom',
                                title: '',
                                content: {
                                    name: 'popover-content',
                                    component: '::div',
                                    className: 'ttk-es-app-customer-download-progress-popover-content',
                                    children: '{{data.downloads[_rowIndex].success==="2"?data.downloads[_rowIndex].message:data.statusType[data.downloads[_rowIndex].success]}}'
                                },
                                children: {
                                    name:'massage',
                                    component:'::div',
                                    className:'{{$massageClass(data.downloads[_rowIndex].success)}}',
                                    children:'{{data.downloads[_rowIndex].success==="2"?data.downloads[_rowIndex].message:data.statusType[data.downloads[_rowIndex].success]}}'
                                }
                            }
                        ],
                        _power: 'for in data.downloads'
                    }
                ]
            },
            {
                name:'btn',
                component:'::div',
                className:'ttk-es-app-customer-download-progress-btn',
                children:[
                    // {
                    //     name:'control',
                    //     component:'Button',
                    //     className:'ttk-es-app-customer-download-progress-btn-control',
                    //     children:'终止下载',
                    //     type:'primary',
                    //     onClick:'{{$stopProgress}}'
                    // },
                    {
                        name:'close',
                        component:'Button',
                        className:'ttk-es-app-customer-download-progress-btn-close',
                        children:'关闭',
                        onClick:'{{$closeProgress}}'
                    }
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