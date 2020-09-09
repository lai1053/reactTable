
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-voucher-batch',
		children: [
			{
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
				_visible: '{{data.loading}}',
				children: {
					name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
					className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
					component: 'Spin',
					size: 'large',
					tip: '数据加载中......',
					delay: 10
				}
			},
			{
				name: 'form',
				component: 'Form',
				className: 'helloworld-add-form',
				children: [{
					name: 'codeItem',
					component: 'Form.Item',
					label: '存货科目',
					children: [ {
						name: 'input',
						style:{
							height: '40px'
						},
						component: 'Select',
						showSearch: true,
						dropdownMatchSelectWidth:false,
						filterOption: '{{$filterIndustry}}',
						value: '{{data.value}}',
						onSelect: "{{function(e){$sf('data.value', e)}}}",
						children: '{{$getSelectOption()}}'
					}]
				}
				]
			},
	]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			value:''
		}
	}
}