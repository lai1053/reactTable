export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory-look',
		children: '{{$renderPage()}}',
	// 	children: [{
	// 		name: 'header',
	// 		component: 'Layout',
	// 		className: 'ttk-stock-app-inventory-look-header-title',
	// 		children: [
	// 			{
	// 			name:'title',
	// 			component:'::div',
	// 			className:'ttk-stock-app-inventory-h2',
	// 			children:[
	// 				{
	// 					name: 'ruku',
	// 					component: '::span',
	// 					className:'ttk-stock-app-inventory-h2',
	// 					children:'{{data.title.titleName}}'
	// 				},
	// 			]
	// 		},
	// 		{
	// 			name: 'form',
	// 			component: 'Form',
	// 			_visible: '{{data.title.titleName!=="生产领料单"}}',
	// 			className: 'helloworld-add-form',
	// 			children: [{
	// 				name: 'codeItem',
	// 				component: 'Form.Item',
	// 				label: '单据编号',
	// 				children: [{
	// 					name: 'code',
	// 					component: '::span',
	// 					children: '{{data.form.code}}',
	// 				}]
	// 			},{
	// 				name: 'enableDate',
	// 				component: 'Form.Item',
	// 				colon: false,
	// 				label: '入库日期:',
	// 				className: 'enableDate',
	// 				children:[{
	// 					name: 'input',
	// 					component: '::span',
	// 					children: "{{data.form.cdate}}",
	// 				}]
	// 			},
	// 			{
	// 				name: 'nameItem',
	// 				component: 'Form.Item',
	// 				label: '往来单位',
	// 				children: [
	// 				{
	// 					name: 'supplierName',
	// 					component: '::span',
	// 					readonly:true,
	// 					children: '{{data.form.supplierName}}',
	// 				},]
	// 			}]
	// 		},{
	// 			name: 'form',
	// 			component: 'Form',
	// 			_visible: '{{data.title.titleName=="生产领料单"}}',
	// 			className: 'helloworld-add-form',
	// 			children: [{
	// 				name: 'codeItem',
	// 				component: 'Form.Item',
	// 				style:{
	// 					width:'100%'
	// 				},
	// 				label: '单据编号',
	// 				children: [{
	// 					name: 'code',
	// 					component: '::span',
	// 					children: '{{data.form.code}}',
	// 				}]
	// 			},{
	// 				name: 'enableDate',
	// 				component: 'Form.Item',
	// 				colon: false,
	// 				label: '入库日期:',
	// 				className: 'enableDate',
	// 				style:{
	// 					position: 'absolute',
	// 					right: '0px'
	// 				},
	// 				children:[{
	// 					name: 'input',
	// 					component: '::span',
	// 					children: "{{data.form.cdate}}",
	// 				}]
	// 			}]
	// 		},]
	// 	},
	// 	{
	// 		name: 'table',
	// 		component: 'DataGrid',
	// 		_visible: '{{data.title.titleName!=="生产领料单"}}',
	// 		scroll: '{{data.tableOption}}',
	// 		// headerHeight: 40,
	// 		style:{minHeight:'270px',border: '1px solid #ccc'},
	// 		className:'ttk-stock-app-inventory-look-form-details',
	// 		rowsCount: '{{data.list.length}}',
	// 		headerHeight: 35,
	// 		rowHeight: 35,
	// 		footerHeight: 35,
	// 		enableSequence: true,
	// 		startSequence: 1,
	// 		// enableSequenceAddDelrow: ' true',
	// 		sequenceFooter: {
	// 			name: 'footer',
	// 			component: 'DataGrid.Cell',
	// 			children: '合计'
	// 		},
	// 		key: '{{data.other.detailHeight}}',
	// 		readonly:false,
	// 		enableAddDelrow:false,
	// 		columns: [{
	// 			name: 'inventoryCode',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'code',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '存货编号'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryCode}}",
	// 				value: "{{data.list[_rowIndex].inventoryCode}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryCode', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'inventoryName',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'name',
	// 			flexGrow: 1,
	// 			width: 150,
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '存货名称'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryName}}",
	// 				value: "{{data.list[_rowIndex].inventoryName}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		}, {
	// 			name: 'inventoryGuiGe',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'size',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'left',
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeader',
	// 				children: '规格型号'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryGuiGe}}",
	// 				value: "{{data.list[_rowIndex].inventoryGuiGe}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryGuiGe', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'workinventoryUnit',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'workinventoryUnit',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'left',
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '单位'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component:'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryUnit}}",
	// 				value: "{{data.list[_rowIndex].inventoryUnit}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryUnit', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'num',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'num',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '数量'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				timeout: true,
	// 				tip: true,
	// 				precision: 2,
	// 				interceptTab: true,
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].num)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].num)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			},
	// 			footer: {
	// 				name: 'footer',
	// 				component: 'DataGrid.Cell',
	// 				className: 'mk-datagrid-cellContent-right',
	// 				children: '{{data.listAll.billBodyNum}}'
	// 			}
	// 		},{
	// 			name: 'price',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'price',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '单价'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].price)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].price)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'ybbalance',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'ybbalance',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '金额'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				timeout: true,
	// 				tip: true,
	// 				precision: 2,
	// 				interceptTab: true,
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].ybbalance,2)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].ybbalance,2)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			},
	// 			footer: {
	// 				name: 'footer',
	// 				component: 'DataGrid.Cell',
	// 				className: 'mk-datagrid-cellContent-right',
	// 				children: '{{data.listAll.billBodyYbBalance}}'
	// 			}
	// 		},
	// 	]
	// 	},
	// 	{
	// 		name: 'table',
	// 		component: 'DataGrid',
	// 		_visible: '{{data.title.titleName=="生产领料单"}}',
	// 		// headerHeight: 40,
	// 		style:{minHeight:'270px',border: '1px solid #ccc'},
	// 		className:'ttk-stock-app-inventory-look-form-details',
	// 		rowsCount: '{{data.list.length}}',
	// 		headerHeight: 35,
	// 		rowHeight: 35,
	// 		startSequence: 1,
	// 		enableSequence: true,
	// 		readonly:false,
	// 		enableAddDelrow:false,
	// 		key: '{{data.other.detailHeight}}',
	// 		columns: [{
	// 			name: 'inventoryCode',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'code',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '存货编号'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryCode}}",
	// 				value: "{{data.list[_rowIndex].inventoryCode}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryCode', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'inventoryName',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'name',
	// 			flexGrow: 1,
	// 			width: 150,
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '存货名称'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title: "{{data.list[_rowIndex].inventoryName}}",
	// 				value: "{{data.list[_rowIndex].inventoryName}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		}, {
	// 			name: 'inventoryGuiGe',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'size',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'left',
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeader',
	// 				children: '规格型号'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component: 'DataGrid.TextCell',
	// 				title: "{{data.list[_rowIndex].inventoryGuiGe}}",
	// 				value: "{{data.list[_rowIndex].inventoryGuiGe}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryGuiGe', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'workinventoryUnit',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'workinventoryUnit',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'left',
	// 			fixed: 'left',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '单位'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'left',
	// 				component:'DataGrid.TextCell',
	// 				title:"{{data.list[_rowIndex].inventoryUnit}}",
	// 				value: "{{data.list[_rowIndex].inventoryUnit}}",
	// 				onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryUnit', e.target.value)}}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'num',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'num',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '数量'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				timeout: true,
	// 				tip: true,
	// 				precision: 2,
	// 				interceptTab: true,
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].num)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].num)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			},
	// 		},{
	// 			name: 'price',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'price',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '单价'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].price)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].price)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			}
	// 		},{
	// 			name: 'ybbalance',
	// 			component: 'DataGrid.Column',
	// 			columnKey: 'ybbalance',
	// 			flexGrow: 1,
	// 			width: 75,
	// 			align:'center',
	// 			header: {
	// 				name: 'header',
	// 				component: 'DataGrid.Cell',
	// 				className: 'dataGrid-tableHeaderNoBoder',
	// 				children: '金额'
	// 			},
	// 			cell: {
	// 				name: 'cell',
	// 				align:'right',
	// 				timeout: true,
	// 				tip: true,
	// 				precision: 2,
	// 				interceptTab: true,
	// 				component: 'DataGrid.TextCell',
	// 				title:"{{$quantityFormat(data.list[_rowIndex].ybbalance)}}",
	// 				value: "{{$quantityFormat(data.list[_rowIndex].ybbalance,2)}}",
	// 				_power: '({rowIndex})=>rowIndex',
	// 			},
	// 		},
	// 	]
	// 	},
	// 	{
	// 		name: 'footer',
	// 		component: 'Layout',
	// 		className: 'ttk-stock-app-inventory-look-footer',
	// 		children: [{
	// 			name: 'nameItem',
	// 			component: 'Form.Item',
	// 			className:'zhidanren',
	// 			style:{
	// 				marginBottom:'-9px',
	// 				overflow: 'hidden',
	// 				float: 'right'
	// 			},
	// 			label: '制单人',
	// 			children: [{
	// 				name: 'name',
	// 				component: '::span',
	// 				className:'',
	// 				children: '{{data.form.operater}}',
					
	// 			}]
	// 		}]
	// 	}
	// ]
	}
}

export function getInitState() {
	return {
		data: {
			title:{
				titleName:'',
			},
			serviceTypeCode: '',
			flag:'',
			listAll:{
				billBodyNum:'0',
				billBodyYbBalance:'0',
			},
			tableOption:{
				x:300,
            },
			form: {
				code: '',
				name:'',
				cdate:'',
				supplierName:'',
				operater: 'liucp',
			},
			list: [],
			other: {
				error:{},
			},
			basic:{
				enableDate:''
			},
			loading: false
		}
	}
}