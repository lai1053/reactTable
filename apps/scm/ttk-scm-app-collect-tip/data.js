export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-collect-tip',
		children: [
			{
				name: 'title',
				component: '::div',
				className: "ttk-scm-app-collect-tip-title",
				children: '尊敬的用户您好！'
			},
			{
				name: 'content',
				component: '::div',
				className: 'ttk-scm-app-collect-tip-content',
				children: '由于发票数据采集会有1-2天的延时，建议您在申报前1-2天认证当前属期发票，不然数据还未同步过来，影响记账、报税的正确性！'
			},
			// {
			// 	name: "content-tip",
			// 	component: '::div',
			// 	className: 'ttk-scm-app-collect-tip-content-tip',
			// 	children: [
			// 		{
			// 			name: 'span1',
			// 			component: '::span',
			// 			children: '增值税税率调整后申报注意事项，各用户务必仔细查看'
			// 		},
			// 		{
			// 			name: 'detail',
			// 			component: '::a',
			// 			children: '详情',
			// 			href: 'http://www.jchl.com/portal/tk/information/information_article.html?contentId=88856EE32601F3D8726C328563B7D149&categoryId=DA5D098F31476AB5695881BE83F9FAE0&categoryCode=001110001005&categoryName=%E8%B4%A2%E7%A8%8E%E5%85%AC%E5%91%8A',
			// 			target: '_blank',
			// 			style: {
			// 				textDecoration: 'underline',
			// 				marginLeft: 5
			// 			}
			// 		}
			// 	]
			// },
			{
				name: 'footer',
				component: '::div',
				className: 'tk-scm-app-collect-tip-footer',
				children: [
					{
						name: 'Checkbox',
						component: 'Checkbox',
						checked: '{{data.checked}}',
						onChange: '{{$onChange}}',
						children: '不再显示',
					},
					{
						name: 'btn',
						component: 'Button',
						type: 'primary',
						onClick: '{{$onOk}}',
						children: '确定',
						style: {
							marginLeft: 16,
							width:57.3
						}
					}
				]
			}
		],

	}
}

export function getInitState() {
	return {
		data: {
			checked: false
		}
	}
}