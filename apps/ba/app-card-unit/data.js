export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'app-card-unit',
        children: [{
            name: 'codeItem',
            component: 'Form.Item',
            label: '编码',
            required: true,
            validateStatus: "{{data.other.error.code?'error':'success'}}",
            help: '{{data.other.error.code}}',
            children: {
                name: 'code',
                component: 'Input',
                // maxlength: '50',
                value: '{{data.form.code}}',
                onChange: "{{function(e){$sf('data.form.code',e.target.value);$changeCheck('code')}}}"
            }

        }, {
            name: 'name',
            component: 'Form.Item',
            label: '名称',
            required: true,
            validateStatus: "{{data.other.error.name?'error':'success'}}",
            help: '{{data.other.error.name}}',
            children: {
                name: 'name',
                component: 'Input',
                // maxlength: '100',
                value: '{{data.form.name}}',
	            onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name')}}}`,
            }

        }]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                code: '',
                name: ''
            },
            other: {
                error: {}
            }
        }
    }
}
