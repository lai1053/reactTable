export function getMeta() {
	return {
		name: 'root',
		component: 'Form',
		className: 'ttk-gl-app-auxassistitem',
		children: [{
			name: 'customer',
			component: 'Form.Item',
			label: '客户',
			colon: false,
			required: true,
			validateStatus: "{{data.other.error.customer?'error':'success'}}",
			help: '{{data.other.error.customer}}',
			_visible: '{{ data.form.accountingSubject.isCalcCustomer}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'customer',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.customer, data.other.customer) }}',
				onChange: `{{$onFieldChange(data.other.customer, 'data.form.auxAccountSubjects.customer')}}`,
				onFocus: "{{function(){$archiveFocus('customer')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.customer && data.other.customer[_rowIndex] }}",
					value: "{{ data.other.customer && data.other.customer[_rowIndex].id }}",
					children: `{{data.other.customer && data.other.customer[_rowIndex].code+" "+data.other.customer[_rowIndex].name }}`,
					_power: 'for in data.other.customer'
				}
			}]
		}, {
			name: 'supplier',
			component: 'Form.Item',
			label: '供应商',
			required: true,
			colon: false,
			_visible: '{{ data.form.accountingSubject.isCalcSupplier}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'supplier',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.supplier, data.other.supplier) }}',
				onChange: `{{$onFieldChange(data.other.supplier, 'data.form.auxAccountSubjects.supplier')}}`,
				onFocus: "{{function(){$archiveFocus('supplier')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.supplier && data.other.supplier[_rowIndex] }}",
					value: "{{ data.other.supplier && data.other.supplier[_rowIndex].id }}",
					children: '{{data.other.supplier && data.other.supplier[_rowIndex].code+" "+data.other.supplier[_rowIndex].name }}',
					_power: 'for in data.other.supplier'
				}
			}]
		}, {
			name: 'project',
			component: 'Form.Item',
			label: '项目',
			required: true,
			colon: false,
			_visible: '{{ data.form.accountingSubject.isCalcProject}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'project',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.project, data.other.project) }}',
				onChange: `{{$onFieldChange(data.other.project, 'data.form.auxAccountSubjects.project')}}`,
				onFocus: "{{function(){$archiveFocus('project')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.project && data.other.project[_rowIndex] }}",
					value: "{{ data.other.project && data.other.project[_rowIndex].id }}",
					children: '{{data.other.project && data.other.project[_rowIndex].code+" "+data.other.project[_rowIndex].name }}',
					_power: 'for in data.other.project'
				}
			}]
		}, {
			name: 'department',
			component: 'Form.Item',
			label: '部门',
			required: true,
			colon: false,
			_visible: '{{ data.form.accountingSubject.isCalcDepartment}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'department',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.department, data.other.department) }}',
				onChange: `{{$onFieldChange(data.other.department, 'data.form.auxAccountSubjects.department')}}`,
				onFocus: "{{function(){$archiveFocus('department')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.department && data.other.department[_rowIndex] }}",
					value: "{{ data.other.department && data.other.department[_rowIndex].id }}",
					children: '{{data.other.department && data.other.department[_rowIndex].name }}',
					_power: 'for in data.other.department'
				}
			}]
		}, {
			name: 'person',
			component: 'Form.Item',
			label: '人员',
			required: true,
			colon: false,
			_visible: '{{ data.form.accountingSubject.isCalcPerson}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'person',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.person, data.other.person) }}',
				onChange: `{{$onFieldChange(data.other.person, 'data.form.auxAccountSubjects.person')}}`,
				onFocus: "{{function(){$archiveFocus('person')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.person && data.other.person[_rowIndex] }}",
					value: "{{ data.other.person && data.other.person[_rowIndex].id }}",
					children: '{{data.other.person && data.other.person[_rowIndex].name }}',
					_power: 'for in data.other.person'
				}
			}]
		}, {
			name: 'inventory',
			component: 'Form.Item',
			label: '存货',
			required: true,
			colon: false,
			_visible: '{{ data.form.accountingSubject.isCalcInventory}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'inventory',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.inventory, data.other.inventory) }}',
				onChange: `{{$onFieldChange(data.other.inventory, 'data.form.auxAccountSubjects.inventory')}}`,
				onFocus: "{{function(){$archiveFocus('inventory')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.inventory && data.other.inventory[_rowIndex] }}",
					value: "{{ data.other.inventory && data.other.inventory[_rowIndex].id }}",
					children: '{{data.other.inventory && data.other.inventory[_rowIndex].code+" "+data.other.inventory[_rowIndex].name }}',
					_power: 'for in data.other.inventory'
				}
			}]
		}, {
			name: 'exCalc1',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc1}}',
			_visible: '{{ data.form.accountingSubject.isExCalc1}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc1',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc1, data.other.exCalc1) }}',
				onChange: `{{$onFieldChange(data.other.exCalc1, 'data.form.auxAccountSubjects.exCalc1')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc1')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc1 && data.other.exCalc1[_rowIndex] }}",
					value: "{{ data.other.exCalc1 && data.other.exCalc1[_rowIndex].id }}",
					children: '{{data.other.exCalc1 && data.other.exCalc1[_rowIndex].code+" "+data.other.exCalc1[_rowIndex].name }}',
					_power: 'for in data.other.exCalc1'
				}
			}]
		}, {
			name: 'exCalc2',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc2}}',
			_visible: '{{ data.form.accountingSubject.isExCalc2}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc2',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc2, data.other.exCalc2) }}',
				onChange: `{{$onFieldChange(data.other.exCalc2, 'data.form.auxAccountSubjects.exCalc2')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc2')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc2 && data.other.exCalc2[_rowIndex] }}",
					value: "{{ data.other.exCalc2 && data.other.exCalc2[_rowIndex].id }}",
					children: '{{data.other.exCalc2 && data.other.exCalc2[_rowIndex].code+" "+data.other.exCalc2[_rowIndex].name }}',
					_power: 'for in data.other.exCalc2'
				}
			}]
		}, {
			name: 'exCalc3',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc3}}',
			_visible: '{{ data.form.accountingSubject.isExCalc3}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc3',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc3, data.other.exCalc3) }}',
				onChange: `{{$onFieldChange(data.other.exCalc3, 'data.form.auxAccountSubjects.exCalc3')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc3')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc3 && data.other.exCalc3[_rowIndex] }}",
					value: "{{ data.other.exCalc3 && data.other.exCalc3[_rowIndex].id }}",
					children: '{{data.other.exCalc3 && data.other.exCalc3[_rowIndex].code+" "+data.other.exCalc3[_rowIndex].name }}',
					_power: 'for in data.other.exCalc3'
				}
			}]
		}, {
			name: 'exCalc4',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc4}}',
			_visible: '{{ data.form.accountingSubject.isExCalc4}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc4',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc4, data.other.exCalc4) }}',
				onChange: `{{$onFieldChange(data.other.exCalc4, 'data.form.auxAccountSubjects.exCalc4')}}`,
				onFocus: "{{function() {$archiveFocus('exCalc4')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc4 && data.other.exCalc4[_rowIndex] }}",
					value: "{{ data.other.exCalc4 && data.other.exCalc4[_rowIndex].id }}",
					children: '{{data.other.exCalc4 && data.other.exCalc4[_rowIndex].code+" "+data.other.exCalc4[_rowIndex].name }}',
					_power: 'for in data.other.exCalc4'
				}
			}]
		}, {
			name: 'exCalc5',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc5}}',
			_visible: '{{ data.form.accountingSubject.isExCalc5}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc5',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc5, data.other.exCalc5) }}',
				onChange: `{{$onFieldChange(data.other.exCalc5, 'data.form.auxAccountSubjects.exCalc5')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc5')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc5 && data.other.exCalc5[_rowIndex] }}",
					value: "{{ data.other.exCalc5 && data.other.exCalc5[_rowIndex].id }}",
					children: '{{data.other.exCalc5 && data.other.exCalc5[_rowIndex]+" "+data.other.exCalc5[_rowIndex].name }}',
					_power: 'for in data.other.exCalc5'
				}
			}]
		}, {
			name: 'exCalc6',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc6}}',
			_visible: '{{ data.form.accountingSubject.isExCalc6}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc6',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc6, data.other.exCalc6) }}',
				onChange: `{{$onFieldChange(data.other.exCalc6, 'data.form.auxAccountSubjects.exCalc6')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc6')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc6 && data.other.exCalc6[_rowIndex] }}",
					value: "{{ data.other.exCalc6 && data.other.exCalc6[_rowIndex].id }}",
					children: '{{data.other.exCalc6 && data.other.exCalc6[_rowIndex]+" "+data.other.exCalc6[_rowIndex].name }}',
					_power: 'for in data.other.exCalc6'
				}
			}]
		}, {
			name: 'exCalc7',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc7}}',
			_visible: '{{ data.form.accountingSubject.isExCalc7}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc7',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc7, data.other.exCalc7) }}',
				onChange: `{{$onFieldChange(data.other.exCalc7, 'data.form.auxAccountSubjects.exCalc7')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc7')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc7 && data.other.exCalc7[_rowIndex] }}",
					value: "{{ data.other.exCalc7 && data.other.exCalc7[_rowIndex].id }}",
					children: '{{data.other.exCalc7 && data.other.exCalc7[_rowIndex].code+" "+data.other.exCalc7[_rowIndex].name }}',
					_power: 'for in data.other.exCalc7'
				}
			}]
		}, {
			name: 'exCalc8',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc8}}',
			_visible: '{{ data.form.accountingSubject.isExCalc8}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc8',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc8, data.other.exCalc8) }}',
				onChange: `{{$onFieldChange(data.other.exCalc8, 'data.form.auxAccountSubjects.exCalc8')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc8')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc8 && data.other.exCalc8[_rowIndex] }}",
					value: "{{ data.other.exCalc8 && data.other.exCalc8[_rowIndex].id }}",
					children: '{{data.other.exCalc8 && data.other.exCalc8[_rowIndex].code+" "+data.other.exCalc8[_rowIndex].name }}',
					_power: 'for in data.other.exCalc8'
				}
			}]
		}, {
			name: 'exCalc9',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc9}}',
			_visible: '{{ data.form.accountingSubject.isExCalc9}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc9',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc9, data.other.exCalc9) }}',
				onChange: `{{$onFieldChange(data.other.exCalc9, 'data.form.auxAccountSubjects.exCalc9')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc9')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc9 && data.other.exCalc9[_rowIndex] }}",
					value: "{{ data.other.exCalc9 && data.other.exCalc9[_rowIndex].id }}",
					children: '{{data.other.exCalc9 && data.other.exCalc9[_rowIndex].code+" "+data.other.exCalc9[_rowIndex].name }}',
					_power: 'for in data.other.exCalc9'
				}
			}]
		}, {
			name: 'exCalc10',
			component: 'Form.Item',
			required: true,
			colon: false,
			label: '{{data.form.accountingSubject.calcDict.isExCalc10}}',
			_visible: '{{ data.form.accountingSubject.isExCalc10}}',
			children: [{
				name: 'lable',
				component: '::span',
				children: '：'
			}, {
				name: 'exCalc10',
				component: 'Select',
				showSearch: true,
				style: { width: 260 },
				filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
				value: '{{ $getDisplayValue(data.form.auxAccountSubjects.exCalc10, data.other.exCalc10) }}',
				onChange: `{{$onFieldChange(data.other.exCalc10, 'data.form.auxAccountSubjects.exCalc10')}}`,
				onFocus: "{{function(){$archiveFocus('exCalc10')}}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					_data: "{{ data.other.exCalc10 && data.other.exCalc10[_rowIndex] }}",
					value: "{{ data.other.exCalc10 && data.other.exCalc10[_rowIndex].id }}",
					children: '{{data.other.exCalc10 && data.other.exCalc10[_rowIndex].code+" "+data.other.exCalc10[_rowIndex].name }}',
					_power: 'for in data.other.exCalc10'
				}
			}]
		}]
	}
}

export function getInitState(option) {
	return {
		data: {
			form: {
				accountingSubject: option,
				auxAccountSubjects: {}
			},
			other: {
				error: {},
				customer: [],
				supplier: [],
				project: [],
				department: [],
				person: [],
				inventory: [],
				isSetFocus: true
			}
		}
	}
}
