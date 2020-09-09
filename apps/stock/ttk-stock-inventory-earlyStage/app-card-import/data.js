import { fetch } from 'edf-utils'

export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'app-asset-import',
        children: [
            {
                name: 'import',
                component: '::p',
                children: [
                    {
                        name: 'left',
                        component: '::span',
                        style: {
                            fontSize: '16px',
                            fontWeight: '700'
                        },
                        children: '业务提示:'
                    }
                ]
            },
            {
                name:'neirong',
                component: '::p',
                children:[
                    {
                        name: 'left',
                        component: '::span',
                        children: '第一步. 到处当前存货期初的数据'
                    }, 
                    {
                        name: 'export',
                        component: 'Button',
                        onClick: '{{$importTemplate}}',
                        className: 'exportIconBtn',
                        title: '导出',
                        children: [
                            {
                                name: 'more',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'daochu',
                                style: {
                                    fontSize: '28px'
                                }
                            }
                        ]
                    }, 
                ]
            },
            {
                name: 'word',
                component: '::p',
                children: '第二步. 针对存货期初数据中的数量、单价、金额等字段进行补充'
            },
            {
                name: 'word',
                component: '::p',
                children: '第三步. 导入入补充后的期初数据'
            },
            {
                name: 'upload',
                component: '::p',
                className: 'bottom',
                children: [
                    {
                        name: 'title',
                        component: '::span',
                        style: {
                            position: 'relative',
                            top: '-6px'
                        },
                        children: '请选择文件：'
                    },
                    {
                        name: 'name',
                        component: 'Input',
                        className: 'file-name',
                        // disabled:true,
                        title: '{{data.file ? data.file.originalName : ""}}',
                        value: '{{data.file ? data.file.originalName : ""}}'
                    },
                    {
                        name: 'upload',
                        component: 'Upload',
                        style: {
                            position: 'absolute'
                        },
                        children: [
                            {
                                name: 'openingBankItem',
                                className:'ant-btn-primary',
                                component: '::span',
                                children: '{{data.file ? "重选文件" :"选择文件"}}'
                            }
                        ],
                        showUploadList: false,
                        action: '/v1/edf/file/upload',
                        headers: '{{$getAccessToken()}}',
                        onChange: '{{$uploadChange}}',
                        beforeUpload: '{{$beforeLoad}}',
                        accept: '.xls, .xlsx'
                    }, 
                ]
            },
        ]
    }
}

export function getInitState() {
    return {
        data: {}
    }
}
