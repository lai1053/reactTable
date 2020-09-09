export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'inv-app-test',
		children:[
			{
				name:'qww',
				component: '::div',
				children: '销项'
			},
			{
				name:'buttom',
				component:'::span',
				_power: 'for in data.sales',
				children:{
					name:'{{data.sales[_rowIndex].className}}',
					
					component:'Button',
					size:'large',
					type:'{{data.sales[_rowIndex].type}}',
					children:'{{data.sales[_rowIndex].title}}',
					onClick:
						'{{function () {$judgeIsChoseBill(data.sales[_rowIndex])}}}'
				}
			},
			
			{
				name:'qww',
				component: '::div',
				style: {
					marginTop: '50px'
				},
				children: '进项'
			},
			{
				name:'pu',
				component:'::span',
				_power: 'for in data.purchase',
				style: {
					display:"inline-block"
				},
				children:{
					name:'{{data.purchase[_rowIndex].className}}',
					component:'Button',
					size:'large',
					type:'{{data.purchase[_rowIndex].type}}',
					children:'{{data.purchase[_rowIndex].title}}',
					onClick:
						'{{function () {$judgeIsChoseBill(data.purchase[_rowIndex])}}}'
				}
				
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			sales:[{
				type: 'inv-app-new-invoices-card',
				name: '增值税专用发票',
				title: '增值税专用发票(销项)－新增',
				fpzl: '01',
				belong: 'common'
			}, {
				type: 'inv-app-new-invoices-card',
				name: '机动车销售发票',
				title: '机动车销售发票(销项)-新增',
				fpzl: '03',
				belong: 'common'
			}, {
				type: 'inv-app-new-invoices-card',
				name: '增值税普通发票',
				title: '增值税普通发票(销项)-新增',
				fpzl: '04',
				belong: 'common'
			}, {
				type: 'inv-app-new-invoices-card',
				name: '二手车统一销售发票',
				title: '二手车统一销售发票(销项)-新增',
				fpzl: '07',
				belong: 'common'
			},{
				type: 'inv-app-new-invoices-card',
				name: '普通机打发票',
				title: '普通机打发票(销项)-新增',
				fpzl: '05',
				belong: 'common'
			}, {
				type: 'inv-app-new-invoices-card',
				name: '纳税检查调整',
				title: '纳税检查调整(销项)-新增',
				fpzl: '08',
				belong: 'general'
			}, {
				type: 'inv-app-new-invoices-card',
				name: '未开具发票',
				title: '未开具发票(销项)-新增',
				fpzl: '09',
				belong: 'common'
			}],
			purchase:[
				{
					type: 'inv-app-new-invoices-card',
					name: '增值税专用发票',
					title: '增值税专用发票(进项)－新增',
					fpzl: '01'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '机动车销售发票',
					title: '机动车销售发票(进项)－新增',
					fpzl: '03'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '增值税普通发票',
					title: '增值税普通发票(进项)－新增',
					fpzl: '04'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '海关专用缴款书',
					title: '海关专用缴款书(进项)－新增',
					fpzl: '13'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '代扣代缴专用缴款书',
					title: '代扣代缴专用缴款书(进项)－新增',
					fpzl: '12'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '农产品销售（收购）发票',
					title: '农产品销售（收购）发票(进项)－新增',
					fpzl: '14'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '通行费发票',
					title: '通行费发票(进项)－新增',
					fpzl: '17'
				},
				{
					type: 'inv-app-new-invoices-card',
					name: '旅客运输服务抵扣凭证',
					title: '旅客运输服务抵扣凭证(进项)－新增',
					fpzl: '18'
				},{
					type: 'inv-app-sales-invoice-card',
					name: '二手车统一销售发票',
					title: '二手车统一销售发票(进项)－新增',
					fpzl: '07'
				},{
					type: 'inv-app-new-invoices-card',
					name: '其他票据',
					title: '其他票据(进项)－新增',
					fpzl: '99'
				},
	
			],
		}
	}
}