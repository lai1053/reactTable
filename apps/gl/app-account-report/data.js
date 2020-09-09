export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'mk-app-report',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'mk-app-report-header',
			_visible: false
		}, {
			name: 'content',
			className: 'mk-app-report-content',
			component: 'Layout',
			children: [{
				name: 'report',
				component: 'Table',
				pagination: false,
				key: '{{Math.random()}}',
				scroll:{ x: 1180 },
				allowColResize: true,
				enableSequenceColumn: false,
				onChange:'{{$tableOnchange}}',
				//loading:true,
				rowSelection: '{{$rowSelection}}',
				//mergeCells: '{{$setMergeCell()}}',
				//scroll: { x: true, y: true },
				bordered: true,
				//width: true,
				dataSource: '{{data.list}}',
				columns: [{
					title: {
						name: 'sort',
						component: 'TableSort',
						sortOrder: '{{data.sort.date}}',
						handleClick: '{{function(e){$sortChange("date",e)}}}',
						title: '日期'
					},
					key: 'voucherDate',
					dataIndex: 'voucherDate',
					render: '{{$rowSpan}}',
					//defaultSortOrder: 'descend',
				}, {
					title: {
						name: 'sort',
						component: 'TableSort',
						sortOrder: '{{data.sort.docCode}}',
						handleClick: '{{function(e){$sortChange("docCode",e)}}}',
						title: '凭证字号'
					},
					dataIndex: 'docCode',
					key: 'docCode',
					render: '{{$rowSpan2}}'
				}, {
					title: '摘要',
					dataIndex: 'abstract',
					key: 'abstract',
				}, {
					title: '科目',
					key: 'accountName',
					dataIndex: 'accountName',
				}, {
					title: '借方',
					key: 'amountDr',
					dataIndex: 'amountDr',
				}, {
					title: '贷方',
					key: 'amountCr',
					dataIndex: 'amountCr',
				}, {
					title: '制单人',
					key: 'marker',
					dataIndex: 'marker',
				}, {
					title: '审核人',
					key: 'auditor',
					dataIndex: 'auditor',
				}, {
					title: '凭证来源',
					key: 'docSource',
					dataIndex: 'docSource',
				}, {
					title: 'Action',
					key: 'operation',
					fixed: 'right',
					className: 'table_fixed_width',
					//componet: 'TableOperate',
					width: '120px',
					render: "{{function(text, record){$operateCol(text, record)}}}"
				}]
			}]
		}, {
			name: 'paging',
			component: 'Pagination',
			bindField: 'paging',
			pageSizeOptions: ['20', '50', '100', '200',]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			key: 1,
			sort:{},
			list: [],
			queryParams: {
				"begindate": '',
				"enddate": '',
				"accountcode": "",
				"groupstr": "inputTaxId",
				"wherestr": ""
			},
			paging: {
				current: 1,
				pageSize: 100,
				total: ''
			},
			filters: {
				currentPage: 1,
				pageSize: 100
			}
			//accountQuery: accountQuery
		}
	}
}