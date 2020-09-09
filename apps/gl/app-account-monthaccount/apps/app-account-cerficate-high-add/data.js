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
				children: [{
					name: 'name',
					component:'Form.Item',
					label: '模板名称',
					className: 'title',
              		colon: false,
              		required: true,
            		validateStatus: "{{data.error.title?'error':'success'}}",
              		help: '{{data.error.title}}',
              		children:{
                  		name: 'input',
						component: 'Input',
						timeout: true,
						disabled: '{{data.other.isEdit!=undefined?!data.other.isEdit:false}}',
                  		value: '{{data.title}}',
                  		onChange: "{{function(e){$fieldChange('data.title',e.target.value)}}}",
					}},
					{
						name: 'button',
						component:'Button',
						className: 'title',
						style:{    
							position: 'absolute',
							right: '20px'
						},
						_visible:'{{data.type=="update"?false:true}}',
						onClick: '{{$changeFalg}}',
						children:'{{data.dataSourceIsCredit==false?"贷方科目来源取值":"借方科目来源取值"}}'
					},
				]
			},
			{
			name: 'span',
			_visible: '{{data.dataSourceIsCredit==false?false:true}}',
			component: 'Table',
			pagination: false,
			className: 'app-account-cerficate-add-body',
			loading: '{{data.other.loading}}',
			allowColResize: false,
			enableSequenceColumn: false,
			bordered: true,
			noDelCheckbox: true,
			scroll:{y:true },
			// scroll:'{{data.list.length > 0 ? data.tableOption : {} }}',
			columns: [{
				title:'摘要',
				colSpan: 2,
				// rowSpan: 0,
				dataIndex: 'summaryNum',
				key:'summaryNum',
				width:'30px',
				render: "{{function(text, record, index){return $renderCell('summaryNum', index, text, record)} }}"
			},
			{
				title: '摘要',
				colSpan: 0,
				dataIndex: 'summary',
				width:'165px',
				key: 'summary',
				render: "{{function(text, record, index){return $renderCell('summary', index, text, record)} }}"
			},
			{
				title: '借方',
				dataIndex: 'debitAccountId',
				width:'220px',
				key: 'debitAccountId',
				render: "{{function(text, record, index){return $renderCell('debitAccountId', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 2,
				dataIndex: 'creditAccountIdNum',
				width:'30px',
				key: 'creditAccountIdNum',
				render: "{{function(text, record, index){return $renderCell('creditAccountIdNum', index, text, record)} }}"
			},
			{
				title: '贷方',
				colSpan: 0,
				dataIndex: 'creditAccountId',
				width:'220px',
				key: 'creditAccountId',
				render: "{{function(text, record, index){return $renderCell('creditAccountId', index, text, record)} }}"
			},
			{
				title: '贷方科目来源',
				// colSpan: 0,
				dataIndex: 'creditDataSources',
				width:'145px',
				key: 'creditDataSources',
				render: "{{function(text, record, index){return $renderCell('creditDataSources', index, text, record)} }}"
			},
			{
				title: '比例',
				dataIndex: 'proportion',
				width:'90px',
				key: 'proportion',
				render: "{{function(text, record, index){return $renderCell('proportion', index, text, record)} }}"
			}
		],
			dataSource: '{{data.list}}',
			onRow: '{{function(record){return $mouseEnter(record)}}}'
		},
		{
			name: 'table',
			_visible: '{{data.dataSourceIsCredit==true?false:true}}',
			component: 'Table',
			pagination: false,
			className: 'app-account-cerficate-add-body',
			loading: '{{data.other.loading}}',
			allowColResize: false,
			enableSequenceColumn: false,
			bordered: true,
			noDelCheckbox: true,
			scroll:{y:true },
			columns: [{
				title:'摘要',
				colSpan: 2,
				// rowSpan: 0,
				dataIndex: 'summaryNum',
				key:'summaryNum',
				width:'30px',
				render: "{{function(text, record, index){return $renderCellCredit('summaryNum', index, text, record)} }}"
			},
			{
				title: '摘要',
				colSpan: 0,
				dataIndex: 'summary',
				width:'165px',
				key: 'summary',
				render: "{{function(text, record, index){return $renderCellCredit('summary', index, text, record)} }}"
			},
			{
				title: '借方',
				colSpan: 2,
				dataIndex: 'debitAccountIdNum',
				width:'30px',
				key: 'debitAccountIdNum',
				render: "{{function(text, record, index){return $renderCellCredit('creditAccountIdNum', index, text, record)} }}"
			},
			{
				title: '借方',
				dataIndex: 'debitAccountId',
				colSpan: 0,
				width:'220px',
				key: 'debitAccountId',
				render: "{{function(text, record, index){return $renderCellCredit('debitAccountId', index, text, record)} }}"
			},
			{
				title: '借方科目来源',
				// colSpan: 0,
				dataIndex: 'creditDataSources',
				width:'145px',
				key: 'creditDataSources',
				render: "{{function(text, record, index){return $renderCellCredit('creditDataSources', index, text, record)} }}"
			},
			{
				title: '比例',
				dataIndex: 'proportion',
				width:'90px',
				key: 'proportion',
				render: "{{function(text, record, index){return $renderCellCredit('proportion', index, text, record)} }}"
			},
			// {
			// 	title: '贷方',
			// 	colSpan: 2,
			// 	dataIndex: 'creditAccountIdNum',
			// 	width:'30px',
			// 	key: 'creditAccountIdNum',
			// 	render: "{{function(text, record, index){return $renderCell('creditAccountIdNum', index, text, record)} }}"
			// },
			{
				title: '贷方',
				// colSpan: 0,
				dataIndex: 'creditAccountId',
				width:'220px',
				key: 'creditAccountId',
				render: "{{function(text, record, index){return $renderCellCredit('creditAccountId', index, text, record)} }}"
			},
			
		],
			dataSource: '{{data.list}}',
			onRow: '{{function(record){return $mouseEnter(record)}}}'
		}
	]
	}
}
export function getInitState(option) {
	return {
		data: {
			dataSourceIsCredit:true,
			error:{
				title: false
			},
			title: '',
			tableOption: {y:true},
			// tableOption: {y:260,x:'100%'},
			list: [{summaryNum: 1,summary: '',debitAccountId:'',creditAccountIdNum:1,creditAccountId:'',proportion:'100',creditDataSources:'',isEditProportion: false}],
			other: {
				loading: false
			}
		}
	}
}
