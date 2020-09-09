export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-card-role',
		children: [{
            name: 'nameItem',
            component: 'Form.Item',
            label: '岗位名称',
            required: true,
            validateStatus: "{{data.other.error.postName?'error':'success'}}",
            help: '{{data.other.error.postName}}',
            children: [{
                name: 'name',
                component: 'Input',
                maxlength: '16',
				value: '{{data.form.postName}}',
				placeholder:'请输入岗位名称',
	            onChange: `{{function(e){$sf('data.form.postName',e.target.value);$changeCheck('postName')}}}`,
            }]
        }, {
            name: 'attributeItem',
            component: 'Form.Item',
            label: '岗位类型',
            required: true,
            validateStatus: "{{data.other.error.postType?'error':'success'}}",
            help: '{{data.other.error.postType}}',
			children: [{
                name: 'roletype',
                component: 'Select',
				showSearch: false,
                style: {width: '100%'},
                placeholder:"请选择岗位类型",
                // optionFilterProp:"children",
                value: '{{(data.other.postTypeObj&&data.other.postTypeObj) ? data.other.postTypeObj.code : data.form.postType }}',
                onChange: "{{function(v){$fieldChange('data.other.postTypeObj',data.other.postTypes.filter(function(data){return data.code == v})[0])}}}",
                children: {
                    name: 'option',
                    component: 'Select.Option',
                    value: '{{data.other.postTypes && data.other.postTypes[_rowIndex].code }}',
                    children: '{{data.other.postTypes && data.other.postTypes[_rowIndex].name }}',
                    _power: 'for in data.other.postTypes'
                }
            }]
        }]
	}
}

export function getInitState() {
	return {
        data: {
            form: {
                postType: null,
                postName: '',
                status: false,
                isEnable: true
            },
            other: {
                error: {}
            }
        }
    }
}