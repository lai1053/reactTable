export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-weikaiqi',
		children: [
			{
				name:'header',
				component:'::div',
				className: 'ttk-stock-app-weikaiqi-header',
				_visible: '{{data.openFlag}}',
				children:[
					{
						name:'context',
						component:'::div',
						className: 'ttk-stock-app-weikaiqi-context',
						children:[
							{
								name:'jiantouicon',
								className: 'jiantou ttk-stock-app-weikaiqi-context-jiantouicon',
								component: '::div',
							},
							{
								name:'shezhiicon',
								component: '::div',
								className: 'weiqidong ttk-stock-app-inventory-conent-img',
							},
							{
								name:'gongye',
								component:'::div',
								className: 'ttk-stock-app-weikaiqi-context-gongye',
								children:[
									{
										name:'gongye',
										component:'::span',
										className: 'ttk-stock-app-weikaiqi-context-gongye-txt1',
										children:'提示:'	
									},{
										
										name:'gongye',
										component:'::span',
										className: 'ttk-stock-app-weikaiqi-context-gongye-txt2',
										children:'尚未启用存货，请前往存货管理-存货设置中设置'
										
									}
								]
							}
						]
					}
					
					
				]
			}]
	}
}

export function getInitState() {
	return {
		data: {
			content: '',
			version: ''
		}
	}
}