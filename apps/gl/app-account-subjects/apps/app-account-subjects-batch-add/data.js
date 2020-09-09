export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-subjects-batch-add',
		component: 'Layout',
		children: [{
			name: 'name',
			component: 'Layout',
			children: {
                name: 'remark',
                component: 'Input.TextArea',
				rows: 4,
                value: '{{data.name}}',
                onChange: "{{function(e){$sf('data.name',e.target.value)}}}"
            }
		}]
	}
}

export function getInitState() {
	return {
		data: {
			name: ''
		}
	}
}