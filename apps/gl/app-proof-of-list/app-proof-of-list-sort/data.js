export function getMeta() {
	return {
		name: 'root',
		className: 'app-proof-of-list-sort',
		component: 'Layout',
		children: [
			{
				name: 'header',
				className: 'app-proof-of-list-sort-header',
				component: '::div',
				children: [
					// {
					// 	name: 'tips',
					// 	className: 'app-proof-of-list-sort-header-left',
					// 	component: '::div',
					// 	children: '说明: 鼠标长按行自由拖动排序'
					// },
					{
						name: 'btns',
						className: 'app-proof-of-list-sort-header-right',
						component: '::div',
						children: [
							{
								name: 'btn1',
								component: 'Button',
								children:'上移',
								type: 'primary',
								disabled: '{{data.other.moveupDisabled}}',
								style: {marginRight:'8px'},
								onClick: '{{$moveup}}'
							},
							{
								name: 'btn2',
								component: 'Button',
								children:'下移',
								type: 'primary',
								disabled: '{{data.other.movedownDisabled}}',
								style: {marginRight:'8px'},
								onClick: '{{$movedown}}'
							},
							{
								name: 'btn3',
								component: 'Button',
								children:'确定',
								onClick: '{{$moveok}}'
							}
						]
					}
				]
			},
			{
				name: 'content',
				component: 'Table',
				pagination: false,
				bordered: true,
        scroll:'{{data.other.tableOption}}',
        className: 'app-proof-of-list-sort-content',
        columns: '{{$renderColumns()}}',
				loading: '{{data.loading}}',
				allowDrag: true,
				allowColResize: false,
				dataSource: '{{data.list}}',
				clickRow: '{{$clickRow}}',
				moveRow: '{{$moveRow}}',
				noDelCheckbox: true,
				onRow: '{{function(record,index){$onRow(record,index)}}}'
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			loading: true,
			list:[],
			other: {
				tableOption: {
					y: 540,
					x: 1000
				}
			}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
		}
	}
}