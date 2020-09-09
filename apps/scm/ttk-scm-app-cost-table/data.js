export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-costTable',
		children: [{
			name: 'option',
			component: '::div',
			className:'ttk-scm-app-costTable-option',
			children:[{
				name:'left',
				component: '::div',
				className:'ttk-scm-app-costTable-option-left',
				children:[{
					name: 'startDate',
					component: 'DatePicker.MonthPicker',
					disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
					noClear: true,
					value: '{{$stringToMoment(data.other.businessDate)}}',
					// onChange: '{{function(v){$sf("data.other.businessDate",$momentToString(v, "YYYY-MM"))}}}'
					onChange: '{{function(v){$handleChangeDate(v)}}}'
				},{
					name: 'type',
					component: 'Select',
					allowClear: true,
					placeholder: '存货分类',
					onChange: '{{function(v){$onFieldChange(v,"type")}}}',
					value: '{{data.other.propertyId}}',
					children:{
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.inventoryTypes && data.other.inventoryTypes[_rowIndex].id}}',
						title: '{{data.other.inventoryTypes[_rowIndex].name}}',
						children: '{{data.other.inventoryTypes[_rowIndex].name}}',
						_power: 'for in data.other.inventoryTypes'
					}
				},{
					name: 'search',
					component: 'Input.Search',
					placeholder: '按存货编码/存货名称搜索',
					value: '{{data.other.paramName}}',
					onSearch:"{{function(e){$onFieldChange(e,'search')}}}",
					onChange: "{{function(e){$onFieldChange(e,'change')}}}"
				}]
			},{
				name: 'right',
				component: '::div',
				className:'ttk-scm-app-costTable-option-right',
				children:[{
					name: 'print',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'btn print dayin',
					type: 'dayin',
					onClick: '{{$print}}',
					title: '打印',
					style: {
						fontSize: 28,
						lineHeight: '30px'
					},
				},{
					name: 'export',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'btn export daochu',
					type: 'daochu',
					title: '导出',
					onClick: '{{$export}}',
					style: {
						fontSize: 28,
						lineHeight: '30px'
					},
				}]
			}]
		},{
			name: 'table',
			component: 'Table',
			emptyShowScroll: true,
			pagination: false,
			className: 'ttk-scm-app-costTable-table',
			allowColResize: false,
			enableSequenceColumn: false,
			loading: '{{data.other.loading}}',
			bordered: true,
			scroll: '{{data.tableOption}}',
			dataSource: '{{data.other.tableList}}',
			noDelCheckbox: true,
			columns: '{{$tableColumns()}}',
		}]
	}
}

export function getInitState() {
	return {
		data: {
			other:{
				loading: true,
				businessDate: '',
				paramName: '',
				// propertyId: '',
				inventoryTypes:[],
				tableList:[],
				disabledTime: ''
			},
			tableOption:{
				x: 1300
			}
		}
	}
}