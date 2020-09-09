export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-addmultiauxitem',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'app-account-addmultiauxitem-header',
			children: [{
				name: 'left',
				component: '::div',
				className: 'app-account-addmultiauxitem-header-left',
				children: [{
					name: 'accountingSubject',
					title: '科目',
					component: '::span',
					children: "{{data.other.accountingSubject.accountCode + ' ' + data.other.accountingSubject.accountName}}",
					className: 'app-account-addmultiauxitem-header-left-accountingSubject',
				}, {
					name: 'directionName',
					dataIndex: 'directionName',
					component: '::span',
					children: "{{'方向：' + data.other.accountingSubject.directionName}}",
					className: 'app-account-addmultiauxitem-header-left-directionName',
				}]
			}]
		}
			, {
			name: 'singleRowContent',
			className: 'app-account-addmultiauxitem-content',
			component: 'Layout',
			// _visible: '{{!!data.other.isDisplaySingleRowGrid}}',
			_visible: '{{!(!!data.other.accountingSubject.isCalcQuantity || !!data.other.accountingSubject.isCalcMulti)}}',
			children: [
				{
					pagination: false,
					className: 'app-account-addmultiauxitem-body',
					name: 'report',
					component: 'Table',
					pagination: false,
					// key: '{{Math.random()}}',
					scroll: '{{ data.colums <= 1000 ? (data.list.length <= 5 ? {x:200,y:0}:{x:200,y:200}) : (data.list.length <= 5 ? {x:(data.colums+250), y:0} : {x:(data.colums+250), y:200})}}',
					// scroll: '{{ data.colums*200 <= 900 ? {x:0,y:200} : {x:(data.colums*200+100), y:200}}}',
					allowColResize: false,
					enableSequenceColumn: true,
					bordered: true,
					dataSource: '{{data.list}}',
					noCalculate: true,
					// loading: '{{data.other.isLoading}}',
					columns: [{
						title: '序号',
						dataIndex: 'number',
						key: 'number',
						align: 'center',
						width: '50px',
                        render: "{{function(text, record, index){return index + 1}}}"
					}, {
						title: '客户',
						dataIndex: 'customer',
						key: 'customer',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcCustomer}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.customers, 'customer', index, text)}}}"
					}, {
						title: '供应商',
						dataIndex: 'supplier',
						key: 'supplier',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcSupplier}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.suppliers, 'supplier', index)}}}"
					},{
						title: '项目',
						dataIndex: 'project',
						key: 'project',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcProject}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.projects, 'project', index)}}}"
					},{
						title: '部门',
						dataIndex: 'department',
						key: 'department',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcDepartment}}',
						//component:'Select',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.departments, 'department', index)}}}"
					}, {
						title: '人员',
						dataIndex: 'person',
						key: 'person',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcPerson}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.persons, 'person', index)}}}"
					}, {
						title: '存货',
						dataIndex: 'inventory',
						key: 'inventory',
						width: '20%',
						_visible: '{{!!data.other.accountingSubject.isCalcInventory}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.inventorys, 'inventory', index)}}}"
					}, {
						width: '20%',
						title: '{{data.assist.isExCalc1}}',
						dataIndex: 'isExCalc1',
						key: 'isExCalc1',
						_visible: '{{!!data.other.accountingSubject.isExCalc1}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc1, 'isExCalc1', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc2}}',
						dataIndex: 'isExCalc2',
						key: 'isExCalc2',
						_visible: '{{!!data.other.accountingSubject.isExCalc2}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc2, 'isExCalc2', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc3}}',
						dataIndex: 'isExCalc3',
						key: 'isExCalc3',
						_visible: '{{!!data.other.accountingSubject.isExCalc3}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc3, 'isExCalc3', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc4}}',
						dataIndex: 'isExCalc4',
						key: 'isExCalc4',
						_visible: '{{!!data.other.accountingSubject.isExCalc4}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc4, 'isExCalc4', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc5}}',
						dataIndex: 'isExCalc5',
						key: 'isExCalc5',
						_visible: '{{!!data.other.accountingSubject.isExCalc5}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc5, 'isExCalc5', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc6}}',
						dataIndex: 'isExCalc6',
						key: 'isExCalc6',
						_visible: '{{!!data.other.accountingSubject.isExCalc6}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc6, 'isExCalc6', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc7}}',
						dataIndex: 'isExCalc7',
						key: 'isExCalc7',
						_visible: '{{!!data.other.accountingSubject.isExCalc7}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc7, 'isExCalc7', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc8}}',
						dataIndex: 'isExCalc8',
						key: 'isExCalc8',
						_visible: '{{!!data.other.accountingSubject.isExCalc8}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc8, 'isExCalc8', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc9}}',
						dataIndex: 'isExCalc9',
						key: 'isExCalc9',
						_visible: '{{!!data.other.accountingSubject.isExCalc9}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc9, 'isExCalc9', index)}}}"
					},{
						width: '20%',
						title: '{{data.assist.isExCalc10}}',
						dataIndex: 'isExCalc10',
						key: 'isExCalc10',
						_visible: '{{!!data.other.accountingSubject.isExCalc10}}',
						render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc10, 'isExCalc10', index)}}}"
					},{
						title: '期初借方余额',
						width: '20%',
						key: 'beginAmountDr',
						dataIndex: 'beginAmountDr',
						render: "{{function(text, record, index){return $renderColumns('', 'beginAmountDr', index)}}}"
					}, 
					{
						title: '期初贷方余额',
						width: '20%',
						key: 'beginAmountCr',
						dataIndex: 'beginAmountCr',
						render: "{{function(text, record, index){return $renderColumns('', 'beginAmountCr', index)}}}"
					}, 
					{
						title: '本年借方累计',
						width: '20%',
						key: 'amountDr',
						dataIndex: 'amountDr',
						_visible: '{{!!data.other.isJanuary}}',
						render: "{{function(text, record, index){return $renderColumns('', 'amountDr', index)}}}"
					}, {
						title: '本年贷方累计',
						width: '20%',
						key: 'amountCr',
						dataIndex: 'amountCr',
						_visible: '{{!!data.other.isJanuary}}',
						render: "{{function(text, record, index){return $renderColumns('', 'amountCr', index)}}}"
					}, {
						title: '操作',
						dataIndex: 'operation',
						fixed: '{{data.colums <= 1000 ? "" : "right"}}',
						key: 'operation',
						align: 'center',
						width: '50px',
						_visible: '{{data.other.type=="add"?true:false}}',
						render: "{{function(text, record, index){return $operateCol(record, index)}}}"
					}]
				}]
		},{
			name: 'doubleRowContent',
			className: 'app-account-addmultiauxitem-content',
			component: 'Layout',
			_visible: '{{(!!data.other.accountingSubject.isCalcQuantity || !!data.other.accountingSubject.isCalcMulti)}}',
			children: [{
				pagination: false,
				className: 'app-account-addmultiauxitem-body',
				name: 'report',
				component: 'Table',
				pagination: false,
				// key: '{{Math.random()}}',
				scroll: '{{ (data.colums) <= 1000 ? (data.list.length <= 5 ? {x:200,y:0} : {x: 200, y: 200}) : data.other.isJanuary ? (data.list.length <= 5 ? {x:(data.colums+600),y:0} : {x: (data.colums+600), y: 200}) : (data.list.length <= 5 ? {x:(data.colums+600),y:0} : {x: (data.colums+600), y: 200})}}',
				// scroll: '{{ (data.colums*200) <= 900 ? {x: 0, y: 200} : data.other.isJanuary ? {x: (data.colums*200+600), y: 200} : {x: (data.colums*200+100), y: 200} }}',
				allowColResize: false,
				enableSequenceColumn: true,
				bordered: true,
				dataSource: '{{data.list}}',
				// loading: '{{data.other.isLoading}}',
				noCalculate: true,
				columns: [{
					title: '序号',
					dataIndex: 'number',
					key: 'number',
					align: 'center',
					width: '50px',
					render: "{{function(text, record, index){return index + 1}}}"
				}, {
					title: '客户',
					dataIndex: 'customer',
					key: 'customer',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcCustomer}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.customers, 'customer', index, text)}}}"
				}, {
					title: '供应商',
					dataIndex: 'supplier',
					key: 'supplier',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcSupplier}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.suppliers, 'supplier', index)}}}"
				}, {
					title: '项目',
					dataIndex: 'project',
					key: 'project',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcProject}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.projects, 'project', index)}}}"
				},{
					title: '部门',
					dataIndex: 'department',
					key: 'department',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcDepartment}}',
					//component:'Select',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.departments, 'department', index)}}}"
				}, {
					title: '人员',
					dataIndex: 'person',
					key: 'person',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcPerson}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.persons, 'person', index)}}}"
				},{
					title: '存货',
					dataIndex: 'inventory',
					key: 'inventory',
					width: '20%',
					_visible: '{{!!data.other.accountingSubject.isCalcInventory}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.inventorys, 'inventory', index)}}}"
				}, {
					width: '20%',
					title: '{{data.assist.isExCalc1}}',
					dataIndex: 'isExCalc1',
					key: 'isExCalc1',
					_visible: '{{!!data.other.accountingSubject.isExCalc1}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc1, 'isExCalc1', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc2}}',
					dataIndex: 'isExCalc2',
					key: 'isExCalc2',
					_visible: '{{!!data.other.accountingSubject.isExCalc2}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc2, 'isExCalc2', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc3}}',
					dataIndex: 'isExCalc3',
					key: 'isExCalc3',
					_visible: '{{!!data.other.accountingSubject.isExCalc3}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc3, 'isExCalc3', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc4}}',
					dataIndex: 'isExCalc4',
					key: 'isExCalc4',
					_visible: '{{!!data.other.accountingSubject.isExCalc4}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc4, 'isExCalc4', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc5}}',
					dataIndex: 'isExCalc5',
					key: 'isExCalc5',
					_visible: '{{!!data.other.accountingSubject.isExCalc5}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc5, 'isExCalc5', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc6}}',
					dataIndex: 'isExCalc6',
					key: 'isExCalc6',
					_visible: '{{!!data.other.accountingSubject.isExCalc6}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc6, 'isExCalc6', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc7}}',
					dataIndex: 'isExCalc7',
					key: 'isExCalc7',
					_visible: '{{!!data.other.accountingSubject.isExCalc7}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc7, 'isExCalc7', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc8}}',
					dataIndex: 'isExCalc8',
					key: 'isExCalc8',
					_visible: '{{!!data.other.accountingSubject.isExCalc8}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc8, 'isExCalc8', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc9}}',
					dataIndex: 'isExCalc9',
					key: 'isExCalc9',
					_visible: '{{!!data.other.accountingSubject.isExCalc9}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc9, 'isExCalc9', index)}}}"
				},{
					width: '20%',
					title: '{{data.assist.isExCalc10}}',
					dataIndex: 'isExCalc10',
					key: 'isExCalc10',
					_visible: '{{!!data.other.accountingSubject.isExCalc10}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.isExCalc10, 'isExCalc10', index)}}}"
				},{
					width: '20%',
					title: '币种',
					dataIndex: 'currency',
					key: 'currency',
					_visible: '{{!!data.other.accountingSubject.isCalcMulti}}',
					render: "{{function(text, record, index){return $renderSelectColumns(data.other.currencys, 'currency', index)}}}"
				},{
					title: '期初借方余额',
					width: '20%',
					// key: 'beginAmountDr',
					// dataIndex: 'beginAmountDr',
					children:[{
						width: '20%',
						title: '数量',
						key: 'beginQuantityDr',
						dataIndex: 'beginQuantityDr',
						_visible: '{{!!data.other.accountingSubject.isCalcQuantity}}',
						render: "{{function(text, record, index){return $renderColumns('' , 'beginQuantityDr', index)}}}"
					}, {
						width: '20%',
						title: '外币金额',
						key: 'beginOrigAmountDr',
						dataIndex: 'beginOrigAmountDr',
						_visible: '{{!!data.other.accountingSubject.isCalcMulti}}',
						render: "{{function(text, record, index){return $renderColumns('', 'beginOrigAmountDr', index)}}}"
					}, {
						width: '20%',
						title: "{{!!data.other.accountingSubject.isCalcMulti ? '本位币金额' : '金额'}}",
						key: 'beginAmountDr',
						dataIndex: 'beginAmountDr',
						render: "{{function(text, record, index){return $renderColumns('', 'beginAmountDr', index)}}}"
					}]
				}, 
				{
					title: '期初贷方余额',
					width: '20%',
					// key: 'beginAmountDr',
					// dataIndex: 'beginAmountDr',
					children:[{
						width: '20%',
						title: '数量',
						key: 'beginQuantityCr',
						dataIndex: 'beginQuantityCr',
						_visible: '{{!!data.other.accountingSubject.isCalcQuantity}}',
						render: "{{function(text, record, index){return $renderColumns('' , 'beginQuantityCr', index)}}}"
					}, {
						width: '20%',
						title: '外币金额',
						key: 'beginOrigAmountCr',
						dataIndex: 'beginOrigAmountCr',
						_visible: '{{!!data.other.accountingSubject.isCalcMulti}}',
						render: "{{function(text, record, index){return $renderColumns('', 'beginOrigAmountCr', index)}}}"
					}, {
						width: '20%',
						title: "{{!!data.other.accountingSubject.isCalcMulti ? '本位币金额' : '金额'}}",
						key: 'beginAmountCr',
						dataIndex: 'beginAmountCr',
						render: "{{function(text, record, index){return $renderColumns('', 'beginAmountCr', index)}}}"
					}]
				}, 
				{
					title: '本年借方累计',
					width: '20%',
					// key: 'amountDr',
					// dataIndex: 'amountDr',
					_visible: '{{!!data.other.isJanuary}}',
					children: [{
						width: '20%',
						title: '数量',
						key: 'quantityDr',
						dataIndex: 'quantityDr',
						_visible: '{{!!data.other.accountingSubject.isCalcQuantity}}',
						render: "{{function(text, record, index){return $renderColumns('', 'quantityDr', index)}}}"
					}, {
						width: '20%',
						title: '外币金额',
						key: 'origAmountDr',
						dataIndex: 'origAmountDr',
						_visible: '{{!!data.other.accountingSubject.isCalcMulti}}',
						render: "{{function(text, record, index){return $renderColumns('', 'origAmountDr', index)}}}"
					}, {
						width: '20%',
						title: "{{!!data.other.accountingSubject.isCalcMulti ? '本位币金额' : '金额'}}",
						key: 'amountDr',
						dataIndex: 'amountDr',
						render: "{{function(text, record, index){return $renderColumns('', 'amountDr', index)}}}"
					}]
				}, {
					title: '本年贷方累计',
					width: '20%',
					// key: 'amountCr',
					// dataIndex: 'amountCr',
					_visible: '{{!!data.other.isJanuary}}',
					children:[{
						width: '20%',
						title: '数量',
						key: 'quantityCr',
						dataIndex: 'quantityCr',
						_visible: '{{!!data.other.accountingSubject.isCalcQuantity}}',
						render: "{{function(text, record, index){return $renderColumns('', 'quantityCr', index)}}}"
					}, {
						width: '20%',
						title: '外币金额',
						key: 'origAmountCr',
						dataIndex: 'origAmountCr',
						_visible: '{{!!data.other.accountingSubject.isCalcMulti}}',
						render: "{{function(text, record, index){return $renderColumns('', 'origAmountCr', index)}}}"
					}, {
						width: '20%',
						title: "{{!!data.other.accountingSubject.isCalcMulti ? '本位币金额' : '金额'}}",
						key: 'amountCr',
						dataIndex: 'amountCr',
						render: "{{function(text, record, index){return $renderColumns('', 'amountCr', index)}}}"
					}]
				},{
					title: '操作',
					dataIndex: 'operation',
					fixed: '{{(data.colums) <= 1000 ? "" : "right"}}',
					key: 'operation',
					align: 'center',
					width: '50px',
					_visible: '{{data.other.type=="add"?true:false}}',
					className: 'app-account-addmultiauxitem-operation-fixed',
					render: "{{function(text, record, index){return $operateCol(record, index)}}}"
				}]
			}]
		}

		]
	}
}


export const blankAuxItem = {
	department: undefined,
	person: undefined,
	customer: undefined,
	supplier: undefined,
	inventory: undefined,
	project: undefined,
	currency: undefined,
	beginQuantity: undefined, //期初余额数量
	beginOrigAmount: undefined, //期初余额外币
	beginAmount: undefined, // 期初余额金额
	quantityDr: undefined, // 本年借方数量
	origAmountDr: undefined, // 本年借方外币
	amountDr: undefined, // 本年借方金额
	quantityCr: undefined, //本年贷方数量
	origAmountCr: undefined, //本年贷方外币
	amountCr: undefined,
	isExCalc1: undefined,
	isExCalc2: undefined,
	isExCalc3: undefined,
	isExCalc4: undefined,
	isExCalc5: undefined,
	isExCalc6: undefined,
	isExCalc7: undefined,
	isExCalc8: undefined,
	isExCalc9: undefined,
	isExCalc10: undefined,
}

export function getInitState(option) {
	return {
		data: {
			list: [
				blankAuxItem,
				blankAuxItem,
				blankAuxItem,
				blankAuxItem,
				blankAuxItem
			],
			filter: {
				targetKey: '5000010001',
				isCalcQuantity: false,
				isCalcMulti: false
			},
			other: {
				directionName: '方向：贷',
				// customers: [{ id: 3816556036411392, name: 'ch2' },
				// { id: 3816574142566400, name: 'ch11' }],
				customers: [],
				accountingSubject: option.accountingSubject,
				isJanuary: option.isNotJanuary,
				currencys: [],
				isLoading: true,
				type: 'add'
			},
			assist: option.calcDict,
			calcDictList: option.calcDict,
			colums: option.colums,
			isShowScrollY: false
		
		}
	}
}

