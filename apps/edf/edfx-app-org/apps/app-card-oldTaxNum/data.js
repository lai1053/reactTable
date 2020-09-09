import moment from 'moment'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-card-oldTaxNum',
        children: [{
            name: 'nameItem',
            component: 'Form.Item',
            className: 'vatTaxpayerNum',
            label: '旧税号',
            validateStatus: "{{data.error.oldTaxNum?'error':'success'}}",
            help: '{{data.error.oldTaxNum}}',
            children: [{
                name: 'name',
                component: 'Input',
                value: '{{data.form.oldTaxNum}}',
	            onChange: `{{function(e){$sf('data.form.oldTaxNum',e.target.value)}}}`,
                onFocus: "{{function() {$setField('data.error.oldTaxNum', undefined)}}}",
            },
            //     {
            //     name: 'oldVatTaxpayerNumInput',
            //     component: '::div',
            //     className: 'oldVatTaxpayerNumInput',
            //     children:{
            //         name: 'remind',
            //         component: 'Popover',
            //         placement: 'right',
            //         content: [
            //             {
            //                 name: 'p',
            //                 component: '::div',
            //                 children: '旧税号必须与纳税人识别号的第3位---第17位一致才可以保存'
            //             }],
            //         children: {
            //             name: 'icon',
            //             component: 'Icon',
            //             fontFamily: 'edficon',
            //             type: 'bangzhutishi'
            //         }
            //     }
            // },
            ]

        }]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                oldTaxNum: '',
                status: false,
                isEnable: true
            },
            error: {}
        }
    }
}
