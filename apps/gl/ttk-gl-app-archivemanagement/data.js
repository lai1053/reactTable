export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-gl-app-archivemanagement',
		children: [{
			name: 'tree',
			component: '::div',
			className: 'ttk-gl-app-archivemanagement-left',
			children: [{
				name: 'desc',
				component: '::div',
				className: 'span',
				children: '会计期间'
			}, {
				name: 'content',
				component: 'Tree',
				className: 'tree',
				showIcon: true,
				expandedKeys: '{{data.tree.expandedKeys}}',
				selectedKeys: '{{data.tree.selectedKeys}}',
				onSelect: '{{$onSelect}}',
				onExpand: '{{$onExpand}}',
				disabled: '{{data.other.btnFileDisabled}}',
				children: '{{$renderTreeNodes()}}'
			}]
		}, {
			name: 'content',
			component: 'Layout',
			className: 'ttk-gl-app-archivemanagement-right',
			children: [{
				name: 'content',
				component: '::div',
				className: 'ttk-gl-app-archivemanagement-right-btns',
				children: [{
					name: 'batFile',
					component: 'Button',
					children: '{{data.other.isFileFinish ? "重新归档" : "归档"}}',
					type: 'primary',
					disabled: '{{data.other.btnFileDisabled}}',
					className: 'btn',
					onClick: '{{$batFileClick([])}}'
				}, {
					name: 'downLoadExcel',
					component: 'Button',
					children: '下载excel',
					disabled: '{{data.other.btnDisabled}}',
					className: 'btn',
					onClick: '{{$batchDownLoadExcel}}'
				}, {
					name: 'downloadPdf',
					component: 'Button',
					children: '下载PDF',
					className: 'btn',
					disabled: '{{data.other.btnDisabled}}',
					onClick: '{{$batchDownLoadPdf}}'
				}]
			}, {
				name: 'content',
				className: 'ttk-gl-app-archivemanagement-right-content',
				component: 'Layout',
				children: [{
					name: 'content',
					className: 'archivecontenttable',
					component: 'Table',
					pagination: false,
					allowColResize: false,
					enableSequenceColumn: false,
					loading: '{{data.loading}}',
					bordered: true,
					scroll: '{{data.list.length >  0 ? data.tableOption : {}}}',
					dataSource: '{{data.list}}',
					rowSelection: '{{$getRowSelection()}}',
					checkboxKey: '{{data.other.checkboxKey}}',
					checkboxChange: '{{$checkboxChange}}',
					checkboxValue: '{{data.other.tableCheckbox.checkboxValue}}',
					columns: [{
						title: '归档文件',
						dataIndex: 'fileName',
						key: 'fileName',
						width: '45%',
						render: "{{function(text, record, index){return $getFileName(text, record)}}}"
					}, {
						title: '归档日期',
						dataIndex: 'voucherDate',
						key: 'voucherDate',
						width: '15%',
					}, {
						title: '操作人员',
						dataIndex: 'creator',
						key: 'creator',
						width: '15%',
					}, {
						title: '操作',
						key: 'accountName',
						dataIndex: 'accountName',
						width: '15%',
						render: "{{function(text, record, index){return $renderColumns(text, record)}}}"
					}]
				}]
			}]
		}]
	}
}
export function getInitState() {
	return {
		data: {
			loading: false,
			tree: {
				expandedKeys: [],
				selectedKeys: [],
				finishStates: []
			},
			tableOption: {						
				y: null
			},
			list: [],
			search: {
				name: "",
				vatTaxpayer: undefined,
				officeAddress: ""
			},
			other: {
				isFileFinish: false,
				vatTaxPayerList: [],
				checkboxKey: 'id',
				btnDisabled: false,
				btnFileDisabled: false,
				tableCheckbox: {
					checkboxValue: [],
					selectedOption: []
				}
			}
		}
	}
}
