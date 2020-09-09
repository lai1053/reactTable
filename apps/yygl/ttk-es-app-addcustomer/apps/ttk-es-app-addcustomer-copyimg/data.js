import {consts} from 'edf-consts'
import copyimg from './img/downloadApp.png'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-addcustomer-copyimg',
        style: {background: '#fff'},
        children: [
            {
                name:'imgTitle',
                component:'::div',
                _visible:'{{data.typeImg == 1}}',
                style:{textAlign:'center',paddingTop:'20px',fontWeight:'bold'},
                children:'手机扫一扫下载APP'
            },
            {
                name:'errorTitle',
                component:'::div',
                _visible:'{{data.typeImg == 2}}',
                style:{paddingTop:'20px',fontSize:'12px',marginLeft:'8%'},
                children:[
                    {
                        name:'error1',
                        component:'::span',
                        children:[
                            {
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type:'XDZdanchuang-jinggao',
                                style:{color:'red',marginRight:'5px'}
                            },
                            {
                                name:'errorSpan',
                                component:'::span',
                                children:'登录电子税务局失败：'
                            }
                        ]
                    },
                    {
                        name:'error2',
                        component:'::div',
                        children:'{{data.errorMes}}'
                    },
                    {
                        name:'error3',
                        component:'::div',
                        children:'请运行App，或者扫码下载后安装运行'
                    }
                ]
            },
            {
                name:'imgCon',
                component:'::div',
                className:'ttk-es-app-addcustomer-copyimg-img',
                children:[
                    {
                        name:'imgCon1',
                        component:'::img',
                        src:"{{data.copyimg}}",
                        style:{width:'100%'}
                    },
                    {
                        name:'imgCon2',
                        component:'Input',
                        id:'divId',
                        value:"https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/downloadApp.png",
                        style:{position:'absolute',top:'-9999px'}
                    },
                ]
            },
            {
                name:'copyImg',
                component:'::div',
                style:{textAlign:'center',paddingBottom:'15px',fontSize:'12px'},
                children:[
                    {
                        name:'copy1',
                        component:'::span',
                        children:'您也可'
                    },
                    {
                        name:'copy1',
                        component:'::a',
                        style:{textDecoration:'underline'},
                        children:'复制',
                        onClick:'{{function(){$ButtonClick()}}}'
                    },
                    {
                        name:'copy1',
                        component:'::span',
                        children:'后发送给朋友'
                    }
                ]
            },
            {
                name:'closeBtn',
                component:'Button',
                _visible:'{{data.typeImg == 2}}',
                style:{margin:'10px auto'},
                // type:'primary',
                children:'关闭',
                onClick:'{{function(){$closeM()}}}'
            },
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
                copyimg:copyimg,
                errorMes:'登录手机号：135XXXXXXXX未运行【机器人SMS】App，',
        }
    }
}