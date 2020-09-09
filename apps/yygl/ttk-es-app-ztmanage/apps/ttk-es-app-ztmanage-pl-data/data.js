import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-pl-data',
        style: {background: '#fff'},
        children: [
            {
                name:'loading',
                component: '::div',
               children: [
                   {
                       name: 'icon',
                       component: 'Icon',
                       className:'ttk-es-app-ztmanage-pl-data-animate',
                       style:{
                           fontSize:'20px'
                       },
                       fontFamily:'edficon',
                       type: 'jiazai',
                   },
                   {
                       name:'title',
                       component:'::span',
                       style:{
                           fontSize:'12px',
                           marginLeft:'10px',
                           fontWeight:'bold',
                           color:'#333',
                       },
                       children:'导账进行中，可稍后查看'
                   }
               ]
            },
            {
                name:'p',
                component:'::p',
                style:{
                    fontSize:'12px',
                    marginLeft: '30px',
                    marginBottom: '0',
                    marginTop: '5px',
                },
                children:[
                    {
                        name:'p1',
                        component:'::span',
                        children:'批量导账 '
                    },
                    {
                        name:'p2',
                        component:'::span',
                        style:{
                            fontWeight: 'bold'
                        },
                        children:'{{data.success}}'
                    },
                    {
                        name:'p3',
                        component:'::span',
                        children:' 户，'
                    },
                    {
                        name:'p4',
                        component:'::span',
                        children:'已处理 '
                    },
                    {
                        name:'p5',
                        component:'::span',
                        style:{
                            fontWeight: 'bold'
                        },
                        children:'{{data.detail}}'
                    },
                    {
                        name:'p6',
                        component:'::span',
                        children:' 户。'
                    }
                ]
            }
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            batchId:'',
            success:0,
            detail:0
        }
    }
}