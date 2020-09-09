export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-cerficate-add',
		children: [
			{
				name: 'title',
				component: 'Form',
				className: 'app-account-cerficate-add-defineTitle',
				children: [
					{
							name: 'name',
							component:'Form.Item',
							label: '模板名称',
							className: 'title',
              colon: false,
              required: true,
              validateStatus: "{{data.error.title?'error':'success'}}",
              help: '{{data.error.title}}',
              children: {
                  name: 'input',
									component: 'Input',
									timeout: true,
									disabled: '{{data.other.isEdit!=undefined?!data.other.isEdit:false}}',
                  value: '{{data.title}}',
                  onChange: "{{function(e){$fieldChange('data.title',e.target.value)}}}",
              }
					}
				]
			},
			{
			name: 'span',
			component: 'Table',
			pagination: false,
			className: 'app-account-cerficate-add-body',
			loading: '{{data.other.loading}}',
			allowColResize: false,
			enableSequenceColumn: false,
			bordered: true,
			noDelCheckbox: true,
			scroll:'{{data.list.length > 6 ? data.tableOption : {} }}',
			columns: [{
				title:'摘要',
				colSpan: 2,
				// rowSpan: 0,
				dataIndex: 'summaryNum',
				key:'summaryNum',
				width:'3%',
				render: "{{function(text, record, index){return $renderCell('summaryNum', index, text, record)} }}"
			},
			{
				title: '摘要',
				colSpan: 0,
				dataIndex: 'summary',
				width:'20%',
				key: 'summary',
				render: "{{function(text, record, index){return $renderCell('summary', index, text, record)} }}"
			},
			{
				title: '借方',
				dataIndex: 'debitAccountId',
				width:'28%',
				key: 'debitAccountId',
				render: "{{function(text, record, index){return $renderCell('debitAccountId', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 2,
				dataIndex: 'creditAccountIdNum',
				width:'3%',
				key: 'creditAccountIdNum',
				render: "{{function(text, record, index){return $renderCell('creditAccountIdNum', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 0,
				dataIndex: 'creditAccountId',
				width:'28%',
				key: 'creditAccountId',
				render: "{{function(text, record, index){return $renderCell('creditAccountId', index, text, record)} }}"
			},
			{
				title: '比例',
				dataIndex: 'proportion',
				width:'10%',
				key: 'proportion',
				render: "{{function(text, record, index){return $renderCell('proportion', index, text, record)} }}"
			}
		],
			// columns: '{{$tableColumns()}}',
			dataSource: '{{data.list}}',
			onRow: '{{function(record){return $mouseEnter(record)}}}'
		}]
	}
}
export function getInitState(option) {
	return {
		data: {
			error:{
				title: false
			},
			title: '',
			tableOption: {y:460,x:800},
			list: [{summaryNum: 1,summary: '',debitAccountId:'',creditAccountIdNum:1,creditAccountId:'',proportion:'100',isEditProportion: false}],
			other: {
				loading: false
			}
		}
	}
}
