export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer-assign-import-progress',
        children:[
            {
                name:'progress',
                component:'::div',
                className:'ttk-es-app-customer-import-progress-div',
                children:[
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'jiazai',
                        _visible:'{{!data.importEnd}}',
                        className: 'helpIcon ttk-es-app-customer-import-progress-div-icon-pending'
                    },
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'chenggongtishi',
                        _visible:'{{data.importEnd}}',
                        className: 'helpIcon ttk-es-app-customer-import-progress-div-icon-end'
                    },
                    {
                        name:'progress',
                        component:'::div',
                        className:'ttk-es-app-customer-import-progress-div-importTitle',
                        children:'{{data.importTitle}}'
                    },
                    {
                        name:'item1',
                        component:'::div',
                        className:'ttk-es-app-customer-import-progress-div-item',
                        children:[
                            {
                                name:'name',
                                component:'::div',
                                className:'ttk-es-app-customer-import-progress-div-item-name',
                                children:'成功：'
                            },
                            {
                                name:'value',
                                component:'::div',
                                className:'ttk-es-app-customer-import-progress-div-item-value-success',
                                children:'{{data.successCount}}'
                            }
                        ]
                    },
                    {
                        name:'item2',
                        component:'::div',
                        className:'ttk-es-app-customer-import-progress-div-item',
                        children:[
                            {
                                name:'name',
                                component:'::div',
                                className:'ttk-es-app-customer-import-progress-div-item-name',
                                children:'失败：'
                            },
                            {
                                name:'value',
                                component:'::div',
                                className:'ttk-es-app-customer-import-progress-div-item-value-failed',
                                children:'{{data.failedCount}}'
                            }
                        ]
                    }
                ]
            },
            {
                name:'list',
                component:'::div',
                className:'ttk-es-app-customer-import-progress-list',
                children:[
                    {
                        name:'item',
                        component:'::div',
                        className:'ttk-es-app-customer-import-progress-list-item',
                        children:[
                            {
                                name:'name',
                                component:'::div',
                                className:'ttk-es-app-customer-import-progress-list-item-name',
                                children:'{{data.downloads[_rowIndex].gsmc+"，分配失败："}}'
                            },
                            {
                                name: 'popover',
                                component: 'Popover',
                                popupClassName: 'ttk-es-app-customer-assign-import-progress-popover',
                                placement: 'bottom',
                                title: '',
                                content: {
                                    name: 'popover-content',
                                    component: '::div',
                                    className: 'ttk-es-app-customer-import-progress-popover-content',
                                    children: '{{$renderErrorList(data.downloads[_rowIndex].errmsgs)}}'
                                },
                                children: {
                                    name:'massage',
                                    component:'::div',
                                    className:'ttk-es-app-customer-import-progress-list-item-massage-error',
                                    children:'{{data.downloads[_rowIndex].errmsg}}'
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
                className:'ttk-es-app-customer-import-progress-btn',
                children:[
                    // {
                    //     name:'control',
                    //     component:'Button',
                    //     className:'ttk-es-app-customer-import-progress-btn-control',
                    //     children:'终止导入',
                    //     _visible:'{{!data.importEnd}}',
                    //     onClick:'{{$stopProgress}}'
                    // },
                    {
                        name:'close',
                        component:'Button',
                        className:'ttk-es-app-customer-import-progress-btn-close',
                        children:'确定',
                        _visible:'{{data.importEnd}}',
                        type:'primary',
                        onClick:'{{$closeProgress}}'
                    },
                    {
                        name:'close',
                        component:'Button',
                        className:'ttk-es-app-customer-import-progress-btn-close',
                        children:'下载失败记录',
                        _visible:'{{data.importEnd&&data.failedCount!="0"}}',
                        type:'primary',
                        onClick:'{{$downloadErrorList}}'
                    }
                ]
            }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            downloads:[],
            importEnd:false,
            importTitle:'导入中…',
            successCount:'0',
            failedCount:'0',
            downloadUrl:''
        }
    }
}