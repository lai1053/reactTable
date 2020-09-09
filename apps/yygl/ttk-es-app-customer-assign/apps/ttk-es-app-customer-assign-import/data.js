import {fetch} from 'edf-utils'

export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-es-app-customer-assign-import',
        children: [
            // {
            //     name:'title',
            //     component:'::h4',
            //     children:'业务提示：'
            // },
            {
            name: 'import',
            component: '::p',
            children: [{
                name: 'left',
                component: '::span',
                children: '1. 导出客户的已分配数据，编辑修改'
            }, {
                name: 'center',
                component: 'Button',
                style:{marginLeft:'8px'},
                // children: '导入模板',
                children:[{
                    name:'downLoad',
                    component:'Icon',
                    type:'download',
                    style:{color:'#0066B3',fontSize:'16px'}
                }],
                className: 'importBth',
                onClick: '{{$importAssignData}}'
            }
            ]
        }, {
            name: 'word',
            component: '::p',
            children: '2. 导入修改后的文件，完成分配'
        },
        //     {
        //     name: 'word',
        //     component: '::p',
        //     children: '3. 若模板数据错误，下载纠错文件修改后重新导入'
        // },
            {
            name: 'upload',
            component: '::p',
            className:'bottom',
            children: [
                {
                    name: 'name',
                    component: '::span',
                    // className: 'file-name',
                    title: '{{data.file ? data.file.originalName : ""}}',
                    children: [
                        // {
                        //     name:'span',
                        //     component:'::span',
                        //     children:'请选择导入文件：',
                        //     style:{color:'#333'}
                        // },
                        {
                            name:'input',
                            component:'Input',
                            style:{width:'200px'},
                            placeholder:'请选择分配数据文件',
                            value:'{{data.file ? data.file.originalName : ""}}',
                            disabled:true
                        }
                    ]
                },{
                name: 'upload',
                component: 'Upload',
                children: [{
                    name: 'openingBankItem',
                    className:'ant-btn-primary',
                    component: '::span',
                    style:{marginLeft:'5px'},
                    children: '{{data.file ? "重选文件" :"选择文件"}}'
                }],
                showUploadList: false,
                action: '/v1/edf/file/upload',
                headers: '{{$getAccessToken()}}',
	            onChange: '{{$uploadChange}}',
	            beforeUpload: '{{$beforeLoad}}',
	            // accept: '.xls, .xlsx'
	            accept: '.xls'
            }]
        }, {
                name:'tishi',
                component:'::p',
                style:{
                    fontSize:'12px',
                    paddingTop:'18px',
                    marginBottom:'0'
                },
                children:[
                    {
                        name:'tishi1',
                        component:'::span',
                        children:'温馨提示：',
                        style:{color:'#fd9400'},
                    },
                    {
                        name:'tishi2',
                        component:'::span',
                        children:'只允许修改岗位人员'
                    }
                ]
            },
            {
            name: 'openingBankItem',
            component: '::p',
            className:'noBottom',
            children: {
                component: 'Button',
                children: '下载纠错模板',
                _visible:'{{data.url ? true : false}}',
                onClick:'{{$downloadTemplate}}'
            }
        }]
    }
}

export function getInitState() {
    return {
        data: {
        }
    }
}
