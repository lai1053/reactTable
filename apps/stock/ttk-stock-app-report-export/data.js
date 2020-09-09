
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-report-export',
		children: [
			{
				name:'title',
				component:'::p',
				style:{
					width: '30%',
					float: 'left',
					textAlign: 'right',
					paddingRight: '10px'
				},
				children:'导出格式'
			},
			{
				name: 'statusgroup',
				component: 'Radio.Group',
				className: 'status-group',
				value: '{{data.exportType}}',
				onChange: "{{function(v){$sf('data.exportType',v.target.value)}}}",
				children: [
					{
						name: 'allright',
						style:{
							display: 'block',
							paddingBottom: '15px'
						},
						component: 'Radio',
						key: 'allright',
						value:1,
						children: 'EXCEL整页格式'
					},
					{
						name: 'allright',
						style:{
							display: 'block',
							paddingBottom: '5px'
						},
						component: 'Radio',
						key: 'allright',
						value:2,
						children: 'EXCEL分页格式'
					}
				]
			}
	]
	}
}

export function getInitState() {
	return {
		data: {
			exportType:1
		}
	}
}