import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-pl-edit',
        style: {background: '#fff'},
        children: [
            {
                name:'title',
                component: '::p',
                className:'ttk-es-app-ztmanage-pl-edit-title',
                children:[
                    {
                        name:'title1',
                        component:'::span',
                        children:'温馨提示：',
                    },
                    {
                        name:'title',
                        component:'::span',
                        children:'修改后的"制单人"、"审核人"信息将会自动带入新增凭证。准确选择"所属行业"，提高智能业务核算'
                    },

                ]
            },
            {
                name:'personxx',
                component:'::div',
                className:'ttk-es-app-ztmanage-pl-edit-person',
                children:[{
                    name: 'industrysItem',
                    component: 'Form.Item',
                    label: '所属行业',
                    style: {display: 'flex'},
                    validateStatus: "{{data.other.error.industrys?'error':'success'}}",
                    help: '{{data.other.error.industrys}}',
                    children: [{
                        name: 'industrys',
                        component: 'Select',
                        showSearch: false,
                        style: {width: '259.5px', height: '30px'},
                        value: '{{data.form.industrys}}',
                        placeholder: "请选择所属行业",
                        onChange: "{{function(v,o){$sfs({'data.form.industrys': v, 'data.other.error.industrys': undefined})}}}",
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.industrys[_rowIndex].id}}',
                            children: '{{data.industrys[_rowIndex].name}}',
                            _power: 'for in data.industrys'
                        }
                    }]
                    },
                    {
                        name:'zdr',
                        component:'Form.Item',
                        label: '制单人：',
                        style: {display: 'flex'},
                        validateStatus: "{{data.other.error.financeCreator?'error':'success'}}",
                        help: '{{data.other.error.financeCreator}}',
                        children:[
                            {
                                name:'zdr1',
                                component:'Input',
                                placeholder:'请输入制单人',
                                onBlur: "{{function(e){$sf('data.form.financeCreator', e.target.value)}}}",
                                value: '{{data.form.financeCreator}}',
                                onChange: "{{function(e){$sf('data.form.financeCreator', e.target.value)}}}",
                            }
                        ]

                    },
                    {
                        name: 'financeAuditorItem',
                        component: 'Form.Item',
                        label: '审核人',
                        // required: true,
                        style: {display: 'flex'},
                        validateStatus: "{{data.other.error.financeAuditor?'error':'success'}}",
                        help: '{{data.other.error.financeAuditor}}',
                        children: [{
                            name: 'financeAuditor',
                            component: 'Input',
                            placeholder: '请输入审核人',
                            onBlur: "{{function(e){$sf('data.form.financeAuditor', e.target.value)}}}",
                            value: '{{data.form.financeAuditor}}',
                            onChange: "{{function(e){$sf('data.form.financeAuditor', e.target.value)}}}",
                        }]
                    },{
                        name: 'accountSupervisorItem',
                        component: 'Form.Item',
                        label: '{{$getCheckLabel()}}',
                        // required: true,
                        style: {display: 'flex',marginBottom:'0px'},
                        validateStatus: "{{data.other.error.accountSupervisor?'error':'success'}}",
                        help: '{{data.other.error.accountSupervisor}}',
                        children: [{
                            name: 'accountSupervisor',
                            component: 'Input',
                            placeholder: '请输入账套主管',
                            disabled: '{{!data.isZtzg}}',
                            onBlur: "{{function(e){$sf('data.form.accountSupervisor', e.target.value)}}}",
                            value: '{{data.form.accountSupervisor}}',
                            onChange: "{{function(e){$sf('data.form.accountSupervisor', e.target.value)}}}",
                        }]
                    },
                ]
            }
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            list:[],
                form:{
                    financeCreator:'',
                    financeAuditor:'',
                    industrys:''
                },
                other:{
                    error: {},
                },
            industrys: [
                // {
                //     "id":2000300001,
                //     "name":"制造业",
                //     "code":"001"
                // },
                // {
                //     "id":2000300002,
                //     "name":"商贸业",
                //     "code":"002"
                // },
                // {
                //     "id":2000300003,
                //     "name":"服务业",
                //     "code":"003"
                // },
                // {
                //     "id":2000300004,
                //     "name":"服务业",
                //     "code":"004"
                // }
            ],
            isZtzg:false,//账套主管是否可编辑
        }
    }
}