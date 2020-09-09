
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-job-account',
		children:'{{$renderChildren()}}'
	};
}

export function getInitState() {
	return {
		data: {
			loading: false,
			accountCode:'1',
			finishmark:0,
			list:[

			],
			pagination: {
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
			},
			year: '',
			month: '',
			bmdm: '',
			inputval:'',
			other: {
				permission: {
                    treeData: [],//权限列表
				},
                tableColumns:[],
			},
		}
	};
}
