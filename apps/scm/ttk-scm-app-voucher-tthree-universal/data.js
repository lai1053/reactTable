export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-voucher-kthree',
		children: [
			{
				name:"title",
				component:"::div",
				className:"ttk-scm-app-voucher-kthree-title",
				children:'T3普及版凭证管理'
			},
			{
			name: 'demo',
			component: 'Collapse',
			defaultActiveKey: ['1'],
			className: 'ttk-scm-app-voucher-kthree-div',
			children: [
				{
					name: 'step1',
					component: 'Collapse.Panel',
					header: '1、金财管家发票生成T3普及版凭证成功以后，就可以进入生成T3普及版产品进行查询了',
					key: "1",
					children: [
						{
							name: 'img1',
							component: '::img',
							className: 'img',
							src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/tthreeuniversal/image14.png',
						}]
				},
				{
					name: 'step2',
					component: 'Collapse.Panel',
					header: '2、进入T3普及版产品，点查询凭证',
					key: "2",
					children: [
						{
							name: 'img2',
							component: '::img',
							className: 'img',
							src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/tthreeuniversal/image15.png',
						}]
				},
				{
					name: 'step3',
					component: 'Collapse.Panel',
					header: '3、按照查询条件查询~就可以找到由金财管家生成的T3普及版凭证了',
					key: "3",
					children: [
						{
							name: 'img3',
							component: '::img',
							className: 'img',
							src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/tthreeuniversal/image16.png',
						}]
				}
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			content: 'Hello TTK!!! Successful project initialization',
			version: 'v1.0.0'
		}
	}
}