export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{"ttk-stock-app-inventory-picking-ling "+ data.currentStep}}',
		children: '{{$renderPage()}}',
		// children: [{
		// 	name: 'ttk-stock-app-inventory-picking-ling-div mk-layout',
		// 	className: 'ttk-stock-app-inventory-picking-ling-div',
		// 	component: '::div',
		// 	children: [{
		// 		name: 'ttk-stock-app-spin',
		// 		className: 'ttk-stock-app-spin',
		// 		component: '::div',
		// 		_visible: '{{data.loading}}',
		// 		children: {
		// 			name: 'ttk-stock-app-inventory-picking-ling-spin-icon',
		// 			className: 'ttk-stock-app-inventory-picking-ling-spin-icon',
		// 			component: 'Spin',
		// 			size: 'large',
		// 			tip: '数据加载中......',
		// 			delay: 10
		// 		}
		// 	},{
		// 		name: 'ttk-stock-app-inventory-picking-ling-title',
		// 		className: '{{"ttk-stock-app-inventory-picking-ling-title "+ data.currentStep}}',
		// 		component: '::div',
		// 	},{
		// 		name: 'ttk-stock-app-inventory-picking-ling-sub',
		// 		className: 'ttk-stock-app-inventory-picking-ling-sub',
		// 		component: '::div',
		// 		children: [{
		// 			name: 'sub1',
		// 			className: 'sub-component',
		// 			component: '::div',
		// 			_visible: '{{ (data.currentStep==="step2" || data.currentStep==="step3") && (data.currentStep.indexOf("zangu")<0) }}',
		// 			title: '{{"本次应领料金额："+ $formatNum(data.billBodyYbBalance,2)}}',
		// 			children:[{
		// 				name: 'ttk-stock-app-inventory-picking-ling-sub-search',
		// 				className: 'ttk-stock-app-inventory-picking-ling-sub-search',
		// 				component: 'Input.Search',
		// 				onChange: '{{function(v){$filterCallBack(v)}}}',
		// 				placeholder: '请输入存货名称或存货编码'
		// 			},{
		// 				name: 'ttk-stock-app-inventory-picking-ling-sub-lingliaoCash',
		// 				className: 'ttk-stock-app-inventory-picking-ling-sub-lingliaoCash',
		// 				component: "::span",
		// 				children: '{{"本次应领料金额："+ $formatNum(data.billBodyYbBalance,2)}}'
		// 			}]
		// 		},
		// 		// {
		// 		// 	name: 'sub2',
		// 		// 	className: 'sub-component2',
		// 		// 	_visible: '{{data.currentStep==="step3"}}',
		// 		// 	component: '::div',
		// 		// 	children:{
		// 		// 		name: 'ttk-stock-app-inventory-picking-ling-sub-search',
		// 		// 		className: 'ttk-stock-app-inventory-picking-ling-sub-search',
		// 		// 		component: 'Input.Search',
		// 		// 		onChange: '{{function(v){$filterCallBack(v)}}}',
		// 		// 		placeholder: '请输入存货名称或存货编码'
		// 		// 	}

		// 		// },
		// 		{
		// 			name: 'sub-zangu-title',
		// 			_visible: '{{(data.currentStep.indexOf("zangu")>-1)}}',
		// 			className: 'sub-zangu-title',
		// 			component: '::h3',
		// 			children: '{{"暂估处理"}}'
		// 		}]
		// 	},{
		// 		name: 'ttk-stock-app-inventory-picking-ling-main',
		// 		className: 'ttk-stock-app-inventory-picking-ling-main mk-layout',
		// 		component: '::div',
		// 		children: [{
		// 			_visible: '{{data.currentStep!=="step2"}}',
		// 			name: '{{"ttk-stock-app-inventory-picking-ling-main-table" + data.currentStep}}',
		// 			className: 'ttk-stock-app-inventory-picking-ling-main-table',
		// 			component: 'Table',
		// 			key:'{{data.currentStep+"bomId"}}',
		// 			rowKey:'bomId',
		// 			indentSize: 15,
		// 			bordered: true,
		// 			pagination: false,
		// 			// loading: '{{data.loading}}',
		// 			scroll:'{{data.tableOption}}',
		// 			columns:'{{$renderColumns()}}',
		// 			dataSource: '{{data.list}}',
		// 			emptyShowScroll: true
		// 		}, {
		// 			_visible: '{{data.currentStep==="step2"}}',
		// 			name: 'ttk-stock-app-completion-warehousing-main-table2',
		// 			className: 'ttk-stock-app-inventory-picking-ling-main-table mk-layout',
		// 			component: 'Table',
		// 			key:'{{data.currentStep+"ttk-stock-app-completion-warehousing-main-table2"}}',
		// 			rowKey:'inventoryId',
		// 			rowSelection:'{{$rowSelection()}}',
		// 			checkboxChange: '{{function(){console.log("checkboxChange")}}}',
		// 			// loading: '{{data.loading}}',
		// 			bordered: true,
		// 			scroll:'{{data.tableOption}}',
		// 			columns:'{{$renderColumns()}}',
		// 			dataSource: '{{data.list}}',
		// 			emptyShowScroll: true,
		// 			pagination: false,
		// 		}]
		// 	},{
		// 		name: 'footer-btn',
		// 		component: '::div',
		// 		className: 'ttk-stock-app-inventory-assessment-add-footer-btn',
		// 		children: [{
		// 			name: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum',
		// 			className: '{{"ttk-stock-app-inventory-assessment-add-footer-btn-actualNum "+$visible() }}',
		// 			component: '::span',
		// 			children: [{
		// 				name: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-txt',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-txt',
		// 				component: '::span',
		// 				children: '实际领料'
		// 			},{
		// 				name: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-num',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-num',
		// 				component: '::span',
		// 				children: '{{"数量："+ data.actualTotalNum}}'
		// 			},{
		// 				name: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-cash',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-actualNum-num',
		// 				component: '::span',
		// 				children: '{{"金额："+ data.actualTotalCash + "（元）"}}'
		// 			}]
				
		// 		},{
		// 			name: 'btnGroup',
		// 			component: '::div',
		// 			className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup',
		// 			children: [{
		// 				name: 'btn-save',
		// 				component: 'Button',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
		// 				type: 'primary',
		// 				children: '保存',
		// 				_visible: '{{data.currentStep==="step3"}}',
		// 				// disabled: '{{!data.disabledNext}}',
		// 				onClick: "{{function(e){$save('save')}}}"
		// 			},{
		// 				name: 'btn-next',
		// 				component: 'Button',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
		// 				type: 'primary',
		// 				children: '下一步',
		// 				disabled: '{{data.disabledNext}}',
		// 				_visible: '{{data.currentStep!=="step3"}}',
		// 				onClick: "{{function(e){$switchStep('next')}}}"
		// 			},{
		// 				name: 'btn-prev',
		// 				component: 'Button',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
		// 				type: 'default',
		// 				children: '上一步',
		// 				_visible: '{{data.currentStep!=="step1" && data.currentStep!=="step2" || (data.currentStep==="step2" && data.stepArray[0]!=="step2")}}',
		// 				onClick: "{{function(e){$switchStep('prev')}}}"
		// 			},{
		// 				name: 'btn-cancel',
		// 				component: 'Button',
		// 				className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item btn-cancel',
		// 				children: '取消',
		// 				onClick: '{{function(){$onCancel(false)}}}'
		// 			}]
		// 		}]
		// 	}]
		// },{ 
		// 	name: 'stock-Inventory-gap-tips', //库存缺的提示
		// 	className: 'stock-Inventory-gap-tips',
		// 	component: '::div',
		// 	_visible: '{{data.needToZangu}}',
		// 	children:[{
		// 		name: 'stock-Inventory-gap-tips-txt',
		// 		className: 'stock-Inventory-gap-tips-txt',
		// 		component: '::span',
		// 		children: '{{data.gapTips}}',
		// 	},{
		// 		name: 'stock-Inventory-gap-tips-closeIcon',
		// 		className: 'stock-Inventory-gap-tips-closeIcon',
		// 		component: '::span',
		// 		onClick: '{{function(){$sf("data.needToZangu", false)}}}'
		// 	}]
		// }]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			canSave: false,
			disabledNext: false,
			actualTotalNum: 0,
			actualTotalCash: 0,
			total: 0,
			tableOption: {	y: 334, x: '100%' },
			gapTips: '库存有缺口，下一步将进行暂估处理',
			needToZangu: false,
			selectedRowKeys: [],
			lingliaoCash: 25000,
			list: [],
			nextList: [],
			gapList: [],
			footerNum: 20,
			footerCash: '29,888.00',
			currentStep: 'step1',
			form:{
				showPopoverCard: false,
				filterType: '',
				propertyDetailFilter: [],
				inputVal: '',
				money:'',
				includeSum: false,
			},
			obj: {
				"isDisable": false,
				"isReBack": false,
				"isDelete": false,
				"isFPDelete": false,
				"includeContentEmpty": false,
				"includeSystemData": false,
				"billBodyYbBalance": 49970, //--应领料总金额
				"billBodyDtoList": []
			},
			step3_list: []
		}
	}
}