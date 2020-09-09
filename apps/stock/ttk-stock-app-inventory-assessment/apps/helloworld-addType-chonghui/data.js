
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'helloworld-addType-chonghui',
		onMouseDown: '{{$mousedown}}',
		children: [
            {
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
                _visible: '{{data.loading}}',
                children: '{{$stockLoading()}}'
			},
			{
				name: 'header',
				component: 'Layout',
				className: 'helloworld-addType-chonghui-header-title',
				children: [{
					name: 'inv-app-batch-sale-header',
					component: '::div',
					className: 'inv-app-batch-sale-header',
					children: [{
						name: 'header-left',
						className: 'header-left',
						component: '::div',
						children: [{
							name: 'header-filter-input',
							component: 'Input',
							className: 'inv-app-batch-sale-header-filter-input',
							type: 'text',
							placeholder: '存货编号或存货名称',
							onChange: "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
							prefix: {
								name: 'search',
								component: 'Icon',
								type: 'search'
							}
						}]
					}
					],
				},]
			},
			{
				name: 'content',
				component: 'Layout',
                className: 'helloworld-addType-chonghui-content',
                children: '{{$renderTable()}}'
			},
            {
                name: 'footer-btn',
                component: '::div',
                className: 'helloworld-addType-chonghui-footer-btn',
                children: [{
                    name: 'btnGroup',
                    component: '::div',
                    className: 'helloworld-addType-chonghui-footer-btn-btnGroup',
                    children: [{
                        name: 'cancel',
                        component: 'Button',
                        className: 'helloworld-addType-chonghui-footer-btn-btnGroup-item',
                        children: '取消',
                        onClick: '{{$onCancel}}'
                    }, {
                        name: 'confirm',
                        component: 'Button',
                        className: 'helloworld-addType-chonghui-footer-btn-btnGroup-item',
                        type: 'primary',
                        children: '生成暂估冲回单',
                        onClick: "{{$onOk}}",
                        disabled:"{{data.btnDisabled}}"
                    }]
                }]
            }
	    ]
	}
}

export function getInitState() {
	return {
		data: {
            loading: false,
			// columnData,
			listAll:{
				num:0,
				ybbalance:0
			},
			columns: [],
			form: {
				code: '',
				operater: 'liucp',
			},
			tableOption:{
				y: 345
            },
			list: [
			],
			
			other: {
				error:{},
			},
			basic:{
				enableDate:''
            },
            btnDisabled:true
		}
	}
}