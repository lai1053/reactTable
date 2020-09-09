export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'bovms-app-funds bovms-app-purchase-list',
		children: '{{$renderChildren()}}',
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			tableData: {
				tableSource: [],
				selectedRowKeys: [],
				sortOptin: {},
				editingKey: '',
				tableSettingData: [],
			},
			tableAllList: [],
			bankList:[],
			filterData: {
				yearPeriod: undefined,
				bankAcctId: undefined,
				partyAcctOrSummaryName: undefined,
				vchStateCode: null,
				accountMatchState: null,
				flowfundType: null,
				startAmount: undefined,
				endAmount: undefined
			},
			defaultFilterData: {
                yearPeriod: undefined,
				bankAcctId: undefined,
				partyAcctOrSummaryName: undefined,
				vchStateCode: null,
				accountMatchState: null,
				flowfundType: null,
				startAmount: undefined,
				endAmount: undefined
            },
			pagination: {
				currentPage: 1, //-- 当前页
				pageSize: 50, //-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			totalData: {
				totalFpNum: 0,
			},
			subjectOptionList:[]
		}
	}
}