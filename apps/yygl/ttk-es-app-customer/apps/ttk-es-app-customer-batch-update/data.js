export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer-batch-update',
        children:[
            {
                name: 'nameItem1',
                component: 'Form.Item',
                label: '企业所得税征收方式',
                required: true,
                validateStatus: "{{data.error.payMode?'error':'success'}}",
                help: '{{data.error.payMode}}',
                children: [{
                    name: 'selectMode1',
                    component: 'Select',
                    className: 'inv-ztgl-custom-popover-option',
                    // getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                    value: '{{data.payMode}}',
                    onChange: "{{function (e) {$sf('data.payMode', e);$selectChangeCheck('payMode')}}}",
                    children: {
                        name: 'option',
                        component: '::Select.Option',
                        children: '{{data.modeOption[_rowIndex].name}}',
                        value: '{{data.modeOption[_rowIndex].value}}',
                        _power: 'for in data.modeOption',
                    }
                }]
            },
            {
                name: 'nameItem2',
                component: 'Form.Item',
                label: '企业所得税预缴方式',
                required: false,
                _visible:'{{data.payMode=="1"}}',
                validateStatus: "{{data.error.prepayment?'error':'success'}}",
                help: '{{data.error.prepayment}}',
                children: [{
                    name: 'selectMode2',
                    component: 'Select',
                    className: 'inv-ztgl-custom-popover-option',
                    // getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                    value: '{{data.prepayment}}',
                    onChange: "{{function (e) {$sf('data.prepayment', e)}}}",
                    children: {
                        name: 'option',
                        component: '::Select.Option',
                        children: '{{data.prepaymentOption[_rowIndex].name}}',
                        value: '{{data.prepaymentOption[_rowIndex].value}}',
                        _power: 'for in data.prepaymentOption',
                    }
                }]
            },
            {
                name: 'nameItem3',
                component: 'Form.Item',
                label: '核定征收方式',
                required: false,
                _visible:'{{data.payMode=="2"}}',
                validateStatus: "{{data.error.approval?'error':'success'}}",
                help: '{{data.error.approval}}',
                children: [{
                    name: 'selectMode3',
                    component: 'Select',
                    className: 'inv-ztgl-custom-popover-option',
                    // getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                    value: '{{data.approval}}',
                    onChange: "{{function (e) {$sf('data.approval', e)}}}",
                    children: {
                        name: 'option',
                        component: '::Select.Option',
                        children: '{{data.approvalOption[_rowIndex].name}}',
                        value: '{{data.approvalOption[_rowIndex].value}}',
                        _power: 'for in data.approvalOption',
                    }
                }]
            },
            {
                name: 'nameItem4',
                component: 'Form.Item',
                label: '是否即征即退类型',
                required: false,
                validateStatus: "{{data.error.type?'error':'success'}}",
                help: '{{data.error.type}}',
                children: [{
                    name: 'selectMode4',
                    component: 'Select',
                    className: 'inv-ztgl-custom-popover-option',
                    // getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                    value: '{{data.payType}}',
                    onChange: "{{function (e) {$sf('data.payType', e)}}}",
                    children: {
                        name: 'option',
                        component: '::Select.Option',
                        children: '{{data.typeOption[_rowIndex].name}}',
                        value: '{{data.typeOption[_rowIndex].value}}',
                        _power: 'for in data.typeOption',
                    }
                }]
            },
        ]
    }
}

export function getInitState() {
    return {
        data:{
            payMode:'',
            prepayment:'',
            approval:'',
            payType:'',
            error: {},
            modeOption:[
                {
                    id:1,
                    name:'查账征收',
                    value:'1'
                },
                {
                    id:2,
                    name:'核定征收',
                    value:'2'
                }
            ],
            prepaymentOption:[
                {
                    id:1,
                    name:'按照实际利润额预缴',
                    value:'1'
                },
                {
                    id:2,
                    name:'按上一纳税年度应纳税所得额平均额预缴',
                    value:'2'
                },
                {
                    id:3,
                    name:'按照税务机关确定的其他方法预缴',
                    value:'3'
                }
            ],
            approvalOption:[
                {
                    id:1,
                    name:'核定应纳税所得额',
                    value:'1'
                },
                {
                    id:2,
                    name:'核定应税所得率（能核算收入总额的）',
                    value:'2'
                },
                {
                    id:3,
                    name:'核定应税所得率（能核算成本费用总额的）',
                    value:'3'
                }
            ],
            typeOption:[
                {
                    id:1,
                    name:'是',
                    value:'1'
                },
                {
                    id:2,
                    name:'否',
                    value:'2'
                }
            ],
        }
    }
}