export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-gl-app-asset-list',
		children: [{
			name: 'header',
			component: '::div',
			className: 'ttk-gl-app-asset-list-header',
			children: [{
				name: 's1',
				component: 'Input.Search',
				showSearch: true,
				placeholder: '请输入编码/名称',
				className: 'headercondition',
				value: '{{data.search.name}}',
				onChange: `{{function(e){$sf('data.search.name',e.target.value)}}}`,
				onSearch: '{{function(value){$onSearch("data.search.name",value)}}}'
			}, {
				name: 'header',
				component: '::div',
				className: 'headerstate',
				children: [{
					name: 's2_0',
					component: '::span',
					className: 'hearderspan',
					children: '状态'
				}, {
					name: 's2_1',
					component: 'Select',
					showSearch: false,
					value: '{{data.search.state}}',
					onChange: '{{function(v){$onSearch("data.search.state",data.other.assetState.filter(function(data){return data.value == v})[0].value)}}}',
					children: {
						name: 'option',
						component: 'Select.Option',
						value: "{{data.other.assetState && data.other.assetState[_rowIndex].value}}",
						children: '{{data.other.assetState && data.other.assetState[_rowIndex].label}}',
						_power: 'for in data.other.assetState'
					}
				}]
			}, {
				name: 'header',
				component: '::div',
				className: 'headermonthpicker',
				children: [{
					name: 's3_1',
					component: '::span',
					className: 'hearderspan',
					children: '在本产品折旧开始日期'
				}, {
					name: 's3_2',
					component: 'DatePicker.MonthPicker',
					value: '{{$stringToMoment(data.search.period)}}',
					onChange: "{{function(d){$sf('data.search.period',$momentToString(d,'YYYY-MM'))}}}",
					disabledDate: '{{function(value){return $disabledMonth(value)}}}',
				}]
			}]
		}, {
			name: 'content',
			component: 'Layout',
			className: 'ttk-gl-app-asset-list-content',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				isColumnResizing: false,
				rowHeight: 37,
				ellipsis: true,
				loading: '{{data.other.loading}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns: "{{$getColumns()}}",
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-gl-app-asset-list-footer',
			children: [{
				component: 'Button',
				children: '上一步',
				className: 'calbtn',
				onClick: '{{$preStep}}'
			}, {
				component: 'Button',
				children: '导入',
				type: "primary",
				className: 'calbtn',
				disabled: '{{data.other.isCanNotToNextStep}}',
				onClick: '{{$nextStep}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			search: {
				name: '',
				state: 99,
				period: '2019-05'
			},
			other: {
				loading: false,
				isCanNotToNextStep:true,
				assetState: [{
					label: '全部',
					value: 99
				}, {
					label: '草稿',
					value: 0
				}, {
					label: '正常',
					value: 1
				}]
			}
		}
	}
}
