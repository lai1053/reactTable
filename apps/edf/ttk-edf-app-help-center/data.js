export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-help-center',
		children: [{
			name: 'ttk',
			component: '::a',
			href: '#',
			style: {display: 'none'},
			target: '_blank',
			id: 'helpCenterHype'
		},{
			name: 'list',
			component: '::div',
			className: 'ttk-edf-app-help-center-list',
			children: [{
				name: 'top',
				className: 'ttk-edf-app-help-center-list-top',
				component: '::div',
				children: [{
					name: 'title',
					component: '::span',
					className: 'ttk-edf-app-help-center-list-top-title',
					children: '帮助中心'
				}, {
					name: 'batch',
					component: '::div',
					_visible: false,
					className: 'ttk-edf-app-help-center-list-top-batch',
					children: [{
						name: 'tagread',
						component: 'Button',
						onClick: '{{$markRead}}',
						className: 'ttk-edf-app-help-center-list-top-batch-read',
						type: 'primary',
						children:'标记已读'
					}, {
						name: 'batchDelete',
						component: 'Button',
						onClick: '{{$deleteMsg}}',
						className: 'ttk-edf-app-help-center-list-top-batch-delete',
						children: '批量删除'
					}]
				}]
			}, {
				name: 'content',
				className: 'ttk-edf-app-help-center-list-main',
				component: '::div',
				children: [{
					name: 'doclist',
					component: '::div',
					className: 'ttk-edf-app-help-center-list-main-doclist',
					children: {
                        name: 'dataGrid',
                        component: 'DataGrid',
                        className: 'helpDocList',
                        headerHeight: 36,
                        isColumnResizing: true,
                        rowHeight: 36,
                        lineHeight: 36,
                        ellipsis: true,
                        rowsCount: "{{data.list.length}}",
                        columns: "{{$getListColumns()}}"
                    },
				}]
			}]
		}, {
			name: 'pagination',
			component: '::div',
			_visible: false,
			className: 'ttk-edf-app-help-center-pagination',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
	}
}

export function getInitState() {
	let list = [{
		type: '1',
		name: '产品官方教学视频',
		url: 'http://www.jchl.com/portal/jchl/serviceSupport/course/index.html?categoryCode=001114016006',
	}, {
		type: '2',
		name: '金财管家操作手册',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E9%87%91%E8%B4%A2%E7%AE%A1%E5%AE%B6%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf',
	}, {
		type: '2',
		name: '发票采集税务申报操作手册（简）',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E5%8F%91%E7%A5%A8%E9%87%87%E9%9B%86%E7%A8%8E%E5%8A%A1%E7%94%B3%E6%8A%A5%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C%EF%BC%88%E7%AE%80%EF%BC%89.pdf',
	}, {
		type: '2',
		name: '个人所得税(代扣代缴)操作手册',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E4%B8%AA%E4%BA%BA%E6%89%80%E5%BE%97%E7%A8%8E(%E4%BB%A3%E6%89%A3%E4%BB%A3%E7%BC%B4)%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf',
	}, {
		type: '2',
		name: '生成用友金蝶财务凭证操作手册',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E7%94%9F%E6%88%90%E7%94%A8%E5%8F%8B%E9%87%91%E8%9D%B6%E8%B4%A2%E5%8A%A1%E5%87%AD%E8%AF%81%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf',
	}, {
		type: '2',
		name: '薪酬管理操作手册',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E8%96%AA%E9%85%AC%E7%AE%A1%E7%90%86%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf',
	}, {
		type: '2',
		name: '期末结转-高级自定义凭证操作手册',
		url: 'https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E6%9C%9F%E6%9C%AB%E7%BB%93%E8%BD%AC-%E9%AB%98%E7%BA%A7%E8%87%AA%E5%AE%9A%E4%B9%89%E5%87%AD%E8%AF%81%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf',
	}]
	return {
		data: {
			list,
		}
	}
}