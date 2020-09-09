export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-set-bookkeeping',
		children: [{
			name: 'main',
			component: 'Spin',
			tip: '数据加载中...',
			spinning: '{{data.loading}}',
			children: [
				{
					component: '::div',
					children: [
						{
							name: 'tips',
							component: '::div',
							className:'set-bookkeeping-tips',
							children: '为更快捷的记账，请选择发票默认的结算方式和单据日期'
						},
						{
							name: 'boot-way',
							component: '::div',
							className: 'bookkeeping-item',
							children: [
								{
									component: '::div',
									children: '结算方式：',
									className: 'bookkeeping-item-title',
								}, {
									component: '::div',
									children: '{{$renderBookWay()}}'
								}
							]
						},
						{
							name: 'book-date',
							component: '::div',
							className: 'bookkeeping-item',
							children: [
								{
									component: '::div',
									className: 'bookkeeping-item-title',
									children: '单据日期：'
								},
								{
									component: '::div',
									children: '{{$renderBookDate()}}'
								}
							]
						}
					]
				},
			],
		}
		]
	}
}

export function getInitState() {
	return {
		data: {
			bankAccount: [],
			loading: true,
			form: {
				vatOrEntry:0,
				accountDateSet: null,
				settlement: null,
				bankAccountId: null,
				id:null
			}
		}
	}
}