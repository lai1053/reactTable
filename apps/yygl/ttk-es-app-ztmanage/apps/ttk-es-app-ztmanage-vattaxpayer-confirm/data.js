import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-vattaxpayer-confirm',
        style: {background: '#fff'},
        children: [
            //第一个弹窗
            {
                name:'firstCon',
                component:'::div',
                _visible:'{{data.conVisible}}',
                children:[
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZdanchuang-jinggao',
                        className: 'ttk-es-app-ztmanage-vattaxpayer-confirm-icon' ,
                    },
                    {
                        name:'content1',
                        component:'::span',
                        children:'请确认您已经在所属税务机关办理了纳税人资格变更。'
                    },
                ]
            },
            {//第一个footer
                name:'footer1',
                component:'::div',
                className: 'ttk-es-app-ztmanage-vattaxpayer-confirm-footer' ,
                _visible:'{{data.conVisible}}',
                children:[
                    {
                        name:'cancel',
                        component:'Button',
                        style:{float:'right',top:'9px',right:'30px'},
                        type:'default',
                        children:'取消',
                        onClick:'{{$firstCancel}}'
                    },
                    {
                        name:'ok',
                        component:'Button',
                        style:{float:'right',top:'9px',marginRight:'50px'},
                        type:'primary',
                        children:'确定',
                        onClick:'{{$firstOk}}'
                    },
                ]
            },
            //第二个弹窗
            {
                name:'secondCon',
                component:'::div',
                _visible:'{{!data.conVisible}}',
                children:[
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'XDZdanchuang-jinggao',
                        className: 'ttk-es-app-ztmanage-vattaxpayer-confirm-icon' ,
                    },
                    {
                        name:'content1',
                        component:'::span',
                        children:'纳税人变更后，将启用新身份下的会计科目和业务规则。请确认已经将原身份下的业务处理完毕。'
                    },
                ]
            },
            {//第二个footer
                name:'footer2',
                component:'::div',
                className: 'ttk-es-app-ztmanage-vattaxpayer-confirm-footer' ,
                _visible:'{{!data.conVisible}}',
                children:[
                    {
                        name:'cancel',
                        component:'Button',
                        style:{float:'right',top:'9px',right:'30px'},
                        type:'default',
                        children:'取消',
                        onClick:'{{$firstCancel}}'
                    },
                    {
                        name:'ok',
                        component:'Button',
                        style:{float:'right',top:'9px',marginRight:'50px'},
                        type:'primary',
                        children:'确定',
                        onClick:'{{$secondOk}}'
                    },
                ]
            },
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            conVisible:true
        }
    }
}