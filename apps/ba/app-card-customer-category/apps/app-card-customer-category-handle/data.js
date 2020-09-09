export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-card-customer-category-handle',
        children: [{
            name: 'codeItem',
            component: 'Form.Item',
            label: '名称',
            required: true,
            validateStatus: "{{data.other.error.name?'error':'success'}}",
            help: '{{data.other.error.name}}',
            children: [{
                name: 'name',
                component: 'Input',
                // maxlength: '50',
                value: '{{data.form.name}}',
                onChange: "{{function(e){$sf('data.form.name',e.target.value);$changeCheck('name')}}}"
            }]

        }]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                name: '',
                baseArchiveType:''
            },
            other: {
                error: {},
                baseArchiveType:''
            }
        }
    }
}
