import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-pl',
        style: {background: '#fff'},
        children: [
            //选择账套类型
            {
                name:'plType',
                component: '::div',
                className:'fistPage',
                _visible:'{{!data.isShow}}',
                children: [
                    {
                        name:'title',
                        component:'::p',
                        style:{
                            margin:'0'
                        },
                        children:'请选择要导入的账套'
                    },
                    {
                        name:'plTypeGroup',
                        component:'Radio.Group',
                        value:'{{data.plType == "2" ? 1 :data.plType}}',
                        onChange:'{{function(e){$sf("data.plType",e.target.value)}}}',
                        // children:[
                        //     {
                        //         name:'plType1',
                        //         component:'Radio',
                        //         // disabled:true,
                        //         children:'金财代账（旧版）账套',
                        //         value:0
                        //     },
                        //     {
                        //         name:'plType1',
                        //         component:'Radio',
                        //         // disabled:true,
                        //         children:'其他财务软件账套',
                        //         value:1
                        //     }
                        // ],
                        children:{
                            name:'plType',
                            component:'Radio',
                            disabled:'{{data.plTypeArr[_rowIndex].code != data.distype && data.distype != 2}}',
                            children:'{{data.plTypeArr[_rowIndex].name}}',
                            timeout:5,
                            value:'{{data.plTypeArr[_rowIndex].code}}',
                            _power:'for in data.plTypeArr'
                        }
                    },
                ]
            },
            //选择账套footer
            {
                name:'firstBtn',
                component:'::div',
                _visible:'{{!data.isShow}}',
                className:'firstPageFooter',
                children:[
                    {
                        name:'cancelBtn',
                        component:'Button',
                        style:{float:'right',top:'9px',right:'30px'},
                        type:'default',
                        children:'取消',
                        onClick:'{{$handelCancel}}',
                    },
                    {
                        name:'okBtn',
                        component:'Button',
                        style:{float:'right',top:'9px',marginRight:'50px'},
                        type:'primary',
                        children:'确定',
                        onClick:'{{function(){$handelOK(data.plType)}}}',
                    },
                ]
            },
            //选择导入文件
            {
                name:'importT',
                component:'::div',
                className:'secondPage',
                _visible:'{{data.isShow}}',
                children:[
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
                                    {
                                        name:'span1',
                                        component:'::span',
                                        style:{color:'red'},
                                        children:'*'
                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        children:'上传文件：',
                                        style:{color:'#333',fontSize:'12px'}
                                    },
                                    {
                                        name:'input',
                                        component:'Input',
                                        style:{width:'200px'},
                                        value:'{{data.file ? data.file.originalName : ""}}',
                                        disabled:true
                                    }
                                ]
                            },{
                                name: 'upload',
                                component: 'Upload',
                                multiple:true,
                                children: [{
                                    name: 'openingBankItem',
                                    className:'ant-btn-primary1',
                                    component: '::span',
                                    // style:{marginLeft:'5px'},
                                    children: '{{data.file ? "重选文件" :"选择文件"}}'
                                }],
                                showUploadList: false,
                                action: '/v1/edf/file/upload',
                                headers: '{{$getAccessToken()}}',
                                onChange: '{{$uploadChange}}',
                                // beforeUpload: '{{$beforeLoad}}',
                                // accept: '.xls, .xlsx'
                                accept: '.rar,.zip'
                            }]
                    }
                ]
            },
            //导入文件footer
            {
                name:'secondBtn',
                component:'::div',
                _visible:'{{data.isShow}}',
                className:'secondPageFooter',
                children:[
                    {
                        name:'download',
                        component:'Button',
                        children: '下载导账采集工具 ',
                        style:{
                            fontSize:'12px',
                        },
                        className:'downloadZ',
                        icon:"download",
                        onClick:'{{$downZhgj}}',
                        type: 'primary'
                    },
                    {
                        name:'cancelBtn',
                        component:'Button',
                        style:{float:'right',top:'9px',right:'30px'},
                        type:'default',
                        children:'取消',
                        onClick:'{{$handelCancel}}',
                    },
                    {
                        name:'okBtn',
                        component:'Button',
                        style:{float:'right',top:'9px',marginRight:'50px'},
                        type:'primary',
                        children:'导入',
                        onClick:'{{$handelImport}}',
                    },
                ]
            },

        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            plType: 1,
            plTypeArr: [
                // {name: '一键导入金财代账（旧版）账套', code: 0},
                {name: '导入ZIP账套文件', code: 1}
            ],
            isShow:false,
            list:[],
            filesArr:[],
        }
    }
}