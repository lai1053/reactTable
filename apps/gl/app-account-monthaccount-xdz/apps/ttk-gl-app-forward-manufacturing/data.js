export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-cerficate-add',
		children: [{
			name: 'span',
			component: 'Table',
			pagination: false,
			className: 'app-account-cerficate-add-body',
			loading: '{{data.other.loading}}',
			allowColResize: false,
			enableSequenceColumn: false,
			bordered: true,
			noDelCheckbox: true,
			scroll: '{{data.list.length > 6 ? data.tableOption : {} }}',
			columns: [{
				title: '摘要',
				colSpan: 2,
				// rowSpan: 0,
				dataIndex: 'summaryNum',
				key: 'summaryNum',
				width: '30px',
				render: "{{function(text, record, index){return $renderCell('summaryNum', index, text, record)} }}"
			},
			{
				title: '摘要',
				colSpan: 0,
				dataIndex: 'summary',
				width: '165px',
				key: 'summary',
				render: "{{function(text, record, index){return $renderCell('summary', index, text, record)} }}"
			},
			{
				title: '借方',
				dataIndex: 'debitAccountId',
				width: '190px',
				key: 'debitAccountId',
				render: "{{function(text, record, index){return $renderCell('debitAccountId', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 2,
				dataIndex: 'creditAccountIdNum',
				width: '30px',
				key: 'creditAccountIdNum',
				render: "{{function(text, record, index){return $renderCell('creditAccountIdNum', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 0,
				dataIndex: 'creditAccountId',
				width: '250px',
				key: 'creditAccountId',
				render: "{{function(text, record, index){return $renderCell('creditAccountId', index, text, record)} }}"
			},
			{
				title: '贷方科目来源',
				// colSpan: 0,
				dataIndex: 'creditDataSources',
				width: '145px',
				key: 'creditDataSources',
				render: "{{function(text, record, index){return $renderCell('creditDataSources', index, text, record)} }}"
			},
			{
				title: '比例',
				dataIndex: 'proportion',
				width: '90px',
				key: 'proportion',
				render: "{{function(text, record, index){return $renderCell('proportion', index, text, record)} }}"
			}
			],
			dataSource: '{{data.list}}',
			onRow: '{{function(record){return $mouseEnter(record)}}}'
		}]
	}
}
export function getInitState(option) {
	return {
		data: {
			error: {
				title: false
			},
			title: '',
			tableOption: { y: 400, x: 800 },
			list: [],			
			other: {
				loading: false
			}
		}
	}
}
