import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-change-info',
        style: {background: '#fff'},
        children: [
            {
                name:'firstCon',
                component:'::div',
                style:{height:'200px'},
                children:[
                    {//table表格
                        name: 'changeInfo',
                        className: 'inv-batch-custom-table',
                        component: 'Table',
                        key: 'id',
                        //loading: '{{data.loading}}',
                        // checkboxChange: '{{$checkboxChange}}',
                        bordered: true,
                        scroll: {y:true},
                        dataSource: '{{data.list}}',
                        columns: '{{$renderColumns()}}',
                        // checkboxKey: 'customerId',
                        pagination: false,
                        rowKey: 'id',
                        // checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
                        emptyShowScroll:true,
                        delay: 0,
                        Checkbox: false,
                        enableSequenceColumn: false,
                    },
                ]
            },
            {
                name:'footer1',
                component:'::div',
                className: 'ttk-es-app-ztmanage-vattaxpayer-confirm-footer' ,
                children:[
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
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            columns:[ {
                id: 'nsrsf',
                caption: "纳税人身份",
                fieldName: 'nsrsf',
                // isFixed: true,
                isVisible: true,
                width: '50%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'yxqq',
                caption: "有效期（起）",
                fieldName: 'yxqq',
                // isFixed: true,
                isVisible: true,
                width: '25%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'yxqz',
                caption: "有效期（止）",
                fieldName: 'yxqz',
                // isFixed: true,
                isVisible: true,
                width: '25%',
                isMustSelect: true,
                align: '',
                className:'',
            },],
            list:[
                // {id:0,name:'陈信宏',yxqq:'2019-12-201',yxqz:'2020-02-29'},
                // {id:1,name:'易烊千玺',yxqq:'2019-12-201',yxqz:'2020-02-29'},
                // {id:2,name:'肖战',yxqq:'2019-12-201',yxqz:'2020-02-29'},
                // {id:3,name:'黄景瑜',yxqq:'2019-12-201',yxqz:'2020-02-29'},
                // {id:4,name:'李现',yxqq:'2019-12-201',yxqz:'2020-02-29'},
                // {id:5,name:'刘昊然',yxqq:'2019-12-201',yxqz:'2020-02-29'},
            ],
        }
    }
}