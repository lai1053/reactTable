export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-html2json',
		children: [{
			name: 'container',
			component: '::div',
			className: 'ttk-edf-app-html2json-container',
			children: [
				{
					name: 'left',
					component: '::div',
					className: 'ttk-edf-app-html2json-container-left',
					children: {
						name: 't1',
						component: '::textarea',
						id: 'source',
						placeholder: '<div>HTML to transform</div>',
						classNames: 'ttk-edf-app-html2json-container-left-t1',
						onChange: `{{function(e){$onFieldChange('data.form.t1',e.target.value)}}}`,
						//value: "{{data.form.t1}}"
					}

				}, {
					name: 'right',
					component: '::div',
					className: 'ttk-edf-app-html2json-container-right',
					children: [{
						name: 'output',
						component: '::pre',
						children: "{{data.form.t2}}",
						className: 'ttk-edf-app-html2json-container-right-panel'
					},
					{
						id: 'btnCopy',
						name: 'copy',
						className:'ttk-edf-app-html2json-container-right-copy',
						component: 'Button',
						children: '点我复制',
						onClick:"{{$onCopy}}"
					}]
				}
			]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-edf-app-html2json-footer',
			children: {
				name: 'b1',
				component: 'Button',
				children: '转换',
				type: 'primary',
				onClick: '{{$parseJson}}'
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				t1: '',
				t2: ''

			}
		}
	}
}