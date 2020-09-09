export function getMeta() {
	return {
		name: "root",
		component: "::div",
		// className: 'ttk-stock-app-completion-warehousing-filter-container',
		children: "{{$renderPage()}}",
		// children: [{
		// 	name: 'demo',
		// 	component: '::div',
		// 	className: 'ttk-stock-app-completion-warehousing-filter-div',
		// 	children: [{
		// 		name: 'tips',
		// 		component: '::div',
		// 		children: {
		// 			name: 'ttk-stock-app-completion-warehousing-filter',
		// 			className: 'ttk-stock-app-completion-warehousing-filter',
		// 			component: '::div',
		// 			children: [{
		// 				name: 'ttk-stock-app-completion-warehousing-filter-search',
		// 				className: 'ttk-stock-app-completion-warehousing-filter-search',
		// 				component: 'Input',
		// 				value: '{{data.inputVal}}',
		// 				prefix:'{{$prefixIcon()}}',
		// 				placeholder: '请输入存货编号或存货名称',
		// 				onPressEnter: '{{$handlePressEnter}}',
		// 				onChange: '{{$handleInputChange}}'
		// 				// onSearch: '{{$enterSearch}}'
		// 			},{
		// 				name:'ttk-stock-app-completion-warehousing-filter-search-more',
		// 				className:'ttk-stock-app-completion-warehousing-filter-search-more',
		// 				trigger: "click",
		// 				visible: '{{data.visible}}',
		// 				onVisibleChange: '{{$handleVisibleChange}}',
		// 				component: 'Popover',
		// 				placement: 'bottom',
		// 				children:{
		// 					name: 'ttk-stock-app-completion-warehousing-filter-search-more-popoverBtn',
		// 					className: 'ttk-stock-app-completion-warehousing-filter-search-more-popoverBtn',
		// 					component: '::span',
		// 					children: {
		// 						name: 'filter',
		// 						className: 'filter-icon',
		// 						component:'Icon',
		// 						type: 'filter'
		// 					}
		// 				},
		// 				content: [{
		// 					name: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions',
		// 					className: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions',
		// 					component: '::div',
		// 					children:[{
		// 						name: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions-option1',
		// 						className: 'option1',
		// 						component:'::span',
		// 						children: '存货类型：'
		// 					},{
		// 						name: 'option1-txt',
		// 						className: 'option1-txt',
		// 						component:'Select',
		// 						value:'{{data.form.inventoryType}}',
		// 						placeholder: '请选择',
		// 						filterOption: false,
		// 						showSearch: true,
		// 						onChange:'{{$selectChange}}',
		// 						getPopupContainer:'{{function(trigger){return trigger.parentNode}}}',
		// 						// children: '{{$renderOption()}}'
		// 						children: {
		// 							name: 'option',
		// 							component: 'Select.Option',
		// 							children: '{{data.optionList[_rowIndex] && data.optionList[_rowIndex].inventoryClassName}}',
		// 							value: '{{data.optionList[_rowIndex] && data.optionList[_rowIndex].inventoryClassId}}',
		// 							_power:'for in data.optionList'
		// 						}
		// 					}]
		// 				},{
		// 					name: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions-divisionLine',
		// 					className: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions-divisionLine',
		// 					component: '::hr',
		// 				},{
		// 					name: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions-footer',
		// 					className: 'ttk-stock-app-completion-warehousing-filter-search-filterOptions-footer',
		// 					component: '::div',
		// 					children:[{
		// 						name: 'footerBtn-confirm',
		// 						className: 'footerBtn footerBtn-confirm',
		// 						component:'Button',
		// 						type: 'primary',
		// 						children: '确定',
		// 						onClick: '{{$handlePopoverConfirm}}'
		// 					},{
		// 						name: 'footerBtn-reset',
		// 						className: 'footerBtn footerBtn-reset',
		// 						component:'Button',
		// 						type: 'default',
		// 						children: '重置',
		// 						onClick: '{{$handlePopoverReset}}'
		// 					}]
		// 				}]
		// 			}]
		// 		}
		// 	}]
		// }]
	}
}

export function getInitState() {
	return {
		data: {
			visible: "",
			inputVal: "",
			form: {
				inventoryType: "",
			},
			selectOptions: [],
		},
	}
}
