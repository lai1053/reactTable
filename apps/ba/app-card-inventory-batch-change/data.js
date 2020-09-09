import moment from 'moment';

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-card-inventory-batch-change',
		children:
			{
				name: 'form',
				component: 'Form',
				className: 'app-card-inventory-batch-change-form',
				children: [
					{
						name: 'propertyItem',
						component: 'Form.Item',
						label: '存货及服务分类',
						required: true,
						validateStatus: '{{data.other.error.property?\'error\':\'success\'}}',
						help: '{{data.other.error.property}}',
						children: {
							name: 'property',
							component: 'Select',
							showSearch: false,
							optionFilterProp: 'children',
							value: '{{data.form.property&&JSON.stringify(data.form.property)}}',
							onChange: '{{$propertyChange}}',
							children: {
								name: 'selectItem',
								component: 'Select.Option',
								value: '{{JSON.stringify(data.other.property[_rowIndex])}}',
								children: '{{data.other.property[_rowIndex].name}}',
								_power: 'for in data.other.property'
							}
						}
					}, {
						name: 'propertyDetailItem',
						component: 'Form.Item',
						label: '明细分类',
						required: true,
						_visible: '{{data.isProperty}}',
						validateStatus: '{{data.other.error.propertyDetail?\'error\':\'success\'}}',
						help: '{{data.other.error.propertyDetail}}',
						children: {
							name: 'property',
							component: 'Select',
							showSearch: false,
							optionFilterProp: 'children',
							value: '{{data.form.propertyDetail&&JSON.stringify(data.form.propertyDetail)}}',
							onChange: '{{$propertyDetailChange}}',
							children: {
								name: 'selectItem',
								component: 'Select.Option',
								value: '{{JSON.stringify(data.other.propertyDetailFilter[_rowIndex])}}',
								children: '{{data.other.propertyDetailFilter[_rowIndex].name}}',
								_power: 'for in data.other.propertyDetailFilter'
							}
						}
					}]
			}


	};
}

export function getInitState() {
	return {
		data: {
			form: {
				code: '',
				name: '',
				status: false,
				isEnable: true
			},
			isProperty: false,
			other: {
				error: {}
			}
		}
	};
}
