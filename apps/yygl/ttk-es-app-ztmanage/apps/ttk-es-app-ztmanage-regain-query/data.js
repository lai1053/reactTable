export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-ztmanage-regain-query',
		children: '{{$renderChildren()}}'
	};
}

export function getInitState() {
	return {
		data: {
			loading: true,
			name: '',
			list:[

			],
			pagination: {
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
			},
			num:'',
			
			other: {
                tableColumns:[
					{id:'financeOrgName', fieldName: 'financeOrgName', fieldTitle: '账套名称', caption: '账套名称', isVisible:true, isMustSelect:true, width: 190},
					{id:'accountingStandards', fieldName: 'accountingStandards', fieldTitle: '会计制度', caption: '会计制度', isVisible:true, width: 100},
					{id:'enabledYearAndMonth', fieldName: 'enabledYearAndMonth', fieldTitle: '启用时间', caption: '启用时间', isVisible:true, width: 75},
					{id:'restorerName', fieldName: 'restorerName', fieldTitle: '恢复人', caption: '恢复人', isVisible:true, width: 75},
					{id:'restoreDate', fieldName: 'restoreDate', fieldTitle: '恢复时间', caption: '恢复时间', isVisible:true, width: 75},
					{id:'restoreState', fieldName: 'restoreState', fieldTitle: '状态', caption: '状态', isVisible:true, width: 75},
					{id:'option', fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 100},
                ]
			},
			accountingStandards: [
                {
                    id:2000020001,
                	name:"企业会计准则(一般企业)",
                    code:"2007"
                },
                {
                    id:2000020002,
                    name:"小企业会计准则",
                    code:"2013"
                },
                {
                    id:2000020008,
                    name:"民间非营利组织会计制度",
                    code:"nonprofit"
                },
                {
                    code: "SimplyGeneralEnterprise",
                    id: 2000020016,
                    name: "企业会计准则(一般企业)【精简】",
                },
                {
                    code: "SimplySmallCompany",
                    id: 2000020032,
                    name: "小企业会计准则【精简】",
                }
            ],
		}

	};
}
