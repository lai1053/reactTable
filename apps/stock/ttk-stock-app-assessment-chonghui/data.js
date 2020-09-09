export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-assessment-chonghui',
		onMouseDown: '{{$mousedown}}',
		children: {
			component: '::div',
			name: 'firstChild',
			className: 'ttk-stock-app-assessment-chonghui-firstChild',
			children: [
				{
					name: 'ttk-stock-app-spin',
					className: 'ttk-stock-app-spin',
					component: '::div',
					_visible: '{{data.loading}}',
					children: '{{$stockLoading()}}'
				},
				{
					name: 'header',
					component: 'Layout',
					className: 'ttk-stock-app-assessment-chonghui-header-title',
					children: [{
						name:'title',
						component:'::div',
						className:'ttk-stock-app-inventory-h2',
						children:[{
							name: 'ruku',
							component: '::div',
							className:'ttk-stock-app-inventory-h2',
							children:'暂估冲回单'
						}]
					},
					{
						name: 'form',
						component: 'Form',
						className: 'helloworld-add-form',
						children: [{
							name: 'codeItem',
							component: 'Form.Item',
							label: '单据编号',
							validateStatus: "{{data.other.error.code?'error':'success'}}",
							help: '{{data.other.error.code}}',
							children: [
								{
									name: 'input-span',
									component: '::span',
									className: 'span-text',
									children: '{{data.form.code}}',
								}
							]
						},{
							name: 'enableDate',
							component: 'Form.Item',
							label: '冲回日期',
							className: '{{data.form.editable && "date editableDate" || "date"}}',
							required: '{{$commonEditable()}}',
							validateStatus: "{{data.other.error.cdate?'error':'success'}}",
							help: '{{data.other.error.cdate}}',
							children:[
								{
									_visible: '{{$commonEditable()}}',  // 可编辑状态
									name: 'input',
									component: 'DatePicker',
									disabledDate: '{{$disabledDate}}',
									value: "{{$stringToMoment((data.form.cdate),'YYYY-MM-DD')}}",
									onChange: "{{function(v){$sf('data.form.cdate', $momentToString(v,'YYYY-MM-DD'))}}}",
								},{
									_visible: '{{!$commonEditable()}}',  //不可编辑状态
									name: 'span-text',
									component: '::span',
									className: 'span-text',
									children: "{{data.form.cdate}}"
								}
							]
						},{
							name: 'nameItem',
							component: 'Form.Item',
							label: '往来单位',
							validateStatus: "{{data.other.error.supplierName?'error':'success'}}",
							className: 'form-item-supplier-name wrapperWidth200',
							children: [
							{
								_visible: '{{!$commonEditable()}}',  
								name: 'input-span',
								component: '::span',
								className: 'span-text',
								children: '{{data.form.supplierName}}',
							},
							{
								_visible: '{{$commonEditable()}}', 
								name: 'input',
								component: 'Select',
								showSearch: true,
								filterOption: '{{$filterIndustry}}',
								value: '{{data.form.supplierName}}',
								children: '{{data.form.supplierOptions}}',
								onSelect: "{{function(e){$selectOption('data.form.supplierName',e)}}}",
								notFoundContent:{
									name: 'spinLoading',
									component: 'Spin',
									size: 'small',
									spinning: '{{data.spinLoading}}',
									delay: 1
								},
							},]
						}]
					},]
				},
				{  // table
					name:'div',
					component: '::div',
					className:'ttk-stock-app-assessment-chonghui-DataGrid',
					children: '{{$renderTable()}}'

				},
				{
					name: 'footer',
					component: 'Layout',
					className: 'ttk-stock-app-assessment-footer',
					children: '{{$renderFooter()}}'
				}
			]
		}
		
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			isEdit: false,
			listAll:{
				billBodyNum:'0',
				billBodyYbBalance:'0',
			},
			form: {
				code: '',
				cdate:'',
				supplierName:'',
				supplierOptions: [],
				supplierList: [],
				supplierId:'',
				operater: 'liucp',
			},
			columns: [],
			list: [],
			other: {
				error:{},
			},
		}
	}
}