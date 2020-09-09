export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-scm-raw-material-list',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'app-scm-raw-material-list-header',
				children: [
					{
						name: 'inventoryName',
						component: 'Input.Search',
						showSearch: true,
						placeholder: '名称/规格型号/编码',
						className:'app-scm-raw-material-list-header-left-search',
						onSearch:`{{$refresh}}`,
						value:'{{data.search}}',
						//enterButton:true,
						onChange: `{{$handleChangeSearch}}`,
						onBlur:`{{$refresh}}`,
					},
					{
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						title: '刷新',
						className: 'refreshBtn',
						onClick: '{{$refresh}}'
					},
					
					{
						name: 'addInventory',
						component: 'Button', 
						className:'app-scm-raw-material-list-header-right-add-button',
						type:'primary',
						onClick: '{{$addInventory}}',
						children: '管理存货档案'
					}
				]
			},
			{
				name: 'body',
				component: '::div',
				className: 'app-scm-raw-material-list-body',
				children: [{
					name: 'table',
					component: 'Table',
					key: '{{data.tableKey}}',
					bordered: true,
					pagination: false,
					scroll: '{{data.tableOption}}',
					className: 'app-scm-raw-material-list-body-table',
					loading: '{{data.loading}}',
					columns: '{{data.columns}}',
					dataSource: '{{data.list}}',
				}]
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			search:null,
			loading:false,
			columns: [],
			list: [],
			file:null,
			tableKey:1000,
			tableOption:{
				x:900,
			}
		}
	}
}
