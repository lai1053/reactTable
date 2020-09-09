export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory-assessment-add',
		id:'ttk-stock-app-inventory-assessment-add',
		onMouseDown: '{{$mousedown}}',
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
                className: 'ttk-stock-app-inventory-assessment-add-header-title',
                children: [
                    {
                        name:'title',
                        component:'::div',
                        className:'ttk-stock-app-inventory-h2',
                        children:[{
                            name: 'ruku',
                            component: '::div',
                            className:'ttk-stock-app-inventory-h2',
                            children:'暂估入库单'
                        }]
                    },
                    {
                        name: 'form',
                        component: 'Form',
                        className: 'helloworld-add-form',
                        children: [
                            {
                                name: 'codeItem',
                                component: 'Form.Item',
                                label: '单据编号',
                                // required: '{{$commonEditable()}}',
                                // validateStatus: "{{data.other.error.code?'error':'success'}}",
                                help: '{{data.other.error.code}}',
                                children: [
                                    // {
                                    //     _visible: '{{$commonEditable()}}',  // 可编辑状态 (没有生成凭证 && 没有结转成本)
                                    //     name: 'code',
                                    //     component: 'Input',
                                    //     value: '{{data.formList.code}}',
                                    //     readonly: '{{data.isEdit}}',
                                    //     onChange: "{{function(e){$sf('data.formList.code',e.target.value)}}}",
                                    // },
                                    {
                                        // _visible: '{{!$commonEditable()}}',  //不可编辑状态
                                        name: 'input-span',
                                        component: '::span',
                                        className: 'span-text',
                                        children: '{{data.formList.code}}',
                                    }
                                ]
                            },{
                                name: 'enableDate',
                                component: 'Form.Item',
                                label: '入库日期',
                                className: 'enableDate',
                                // required: '{{$dateEditable()}}',
                                required: '{{$commonEditable()}}',
                                validateStatus: "{{data.other.error.cdate?'error':'success'}}",
                                help: '{{data.other.error.cdate}}',
                                children:[
                                    {
                                        // _visible: '{{$dateEditable()}}',  // 可编辑状态 (只有已经结转了出库凭证才不能编辑)
                                        _visible: '{{$commonEditable()}}', 
                                        name: 'input',
                                        component: 'DatePicker',
                                        disabledDate: '{{$disabledDate}}',
                                        value: "{{$stringToMoment((data.formList.cdate),'YYYY-MM-DD')}}",
                                        onChange: "{{function(v){$sf('data.formList.cdate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                    },
                                    {
                                        // _visible: '{{!$dateEditable()}}',  //不可编辑状态 (只有已经结转了出库凭证才不能编辑)
                                        _visible: '{{!$commonEditable()}}', 
                                        name: 'input-span',
                                        component: '::span',
                                        className: 'span-text',
                                        children: '{{data.formList.cdate}}',
                                    }
                                ]
                            },{
                                name: 'nameItem',
                                component: 'Form.Item',
                                label: '往来单位',
                                className: 'wrapperWidth200',
                                validateStatus: "{{data.other.error.supplierName?'error':'success'}}",
                                help: '{{data.other.error.supplierName}}',
                                children: [
                                {
                                    _visible: '{{!$commonEditable()}}',  
                                    name: 'input-span',
                                    component: '::span',
                                    className: 'span-text',
                                    children: '{{data.formList.supplierName}}',
                                },
                                {
                                    _visible: '{{$commonEditable()}}', 
                                    name: 'input',
                                    component: 'Select',
                                    showSearch: true,
                                    filterOption: '{{$filterIndustry}}',
                                    value: '{{data.formList.supplierName}}',
                                    onSelect: "{{function(e){$selectOption('data.formList.supplierName',e)}}}",
                                    children: '{{$getSelectOption()}}'
                                },]
                            }
                        ]
                    },
                ]
            },
            {
                name: 'content',
                component: 'Layout',
                className:'ttk-stock-app-inventory-assessment-add-content mk-layout',
                // children: '{{$renderTable()}}'
                children:[
                    {
                        name: 'details',
                        component: 'DataGrid',
                        ellipsis: true,
                        className: 'ttk-stock-app-inventory-assessment-add-Body',
                        headerHeight: 35,
                        rowHeight: 35,
                        footerHeight: 35,
                        rowsCount: '{{data.form.details.length}}',
                        enableSequence: true,
                        startSequence: 1,
                        allowResizeColumn: true,
                        sequenceFooter: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            children: '合计'
                        },
                        key: '{{data.other.detailHeight}}',
                        readonly: false,
                        enableSequenceAddDelrow: '{{$commonEditable()}}', //'true',
                        onAddrow: '{{$addRow}}',
                        onDelrow: '{{$delRow("details")}}',
                        onUprow: '{{$upRow("details")}}',
                        onDownrow: '{{$downRow("details")}}',
                        onKeyDown: '{{$gridKeydown}}',
                        scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                        scrollToRow: '{{data.other.detailsScrollToRow}}',
                        columns: [
                            {
                                name: 'code',
                                component: 'DataGrid.Column',
                                columnKey: 'code',
                                flexGrow: 1,
                                width: 75,
                                align:'left',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: 'dataGrid-tableHeaderNoBoder',
                                    children: '存货编号'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    component: 'DataGrid.TextCell',
                                    className: 'inputSelectClass',
                                    value: "{{data.form.details[_rowIndex].code}}",
                                    title:"{{data.form.details[_rowIndex].code}}",
                                    onChange: "{{function(e){$sf('data.form.details.' + _rowIndex + '.code', e.target.value)}}}",
                                    _power: '({rowIndex})=>rowIndex',
                                }
                            },{
                                name: 'name',
                                component: 'DataGrid.Column',
                                columnKey: 'name',
                                flexGrow: 1,
                                _visible:"{{data.formstate==true}}",
                                width: 180,
                                align:'left',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '存货名称'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    component: '::div',
                                    className: '{{`tdChme ${($commonEditable() && " editable" || "")}`}}',
                                    children:[
                                        {
                                            name: 'input',
                                            component: "{{ ( $isFocus(_ctrlPath) && $commonEditable() ) ? 'Select' : 'DataGrid.TextCell'}}",
                                            showSearch: true,
                                            className: 'selectName',
                                            dropdownMatchSelectWidth:false,
                                            dropdownClassName:"selectNameDivDropdown",
                                            dropdownStyle:{width: 'auto'},
                                            notFoundContent:{
                                                name: 'spinLoading',
                                                component: 'Spin',
                                                size: 'small',
                                                spinning: '{{data.fetching}}',
                                                delay: 1
                                            },
                                            _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children'] }}",
                                            title:'{{data.form.details[_rowIndex].name}}',
                                            filterOption: '{{$filterIndustryInventory}}',
                                            value: '{{data.form.details[_rowIndex].name}}',
                                            onSelect: "{{function(e){$selectOptionInventory(_rowIndex,e,data.form.details[_rowIndex].name)}}}",
                                            children: '{{$getSelectOptionInventory()}}',
                                            dropdownFooter: {
                                                name: 'add',
                                                type: 'default',
                                                component: '::div',
                                                className: 'ttk-stock-app-inventory-assessment-add-stockName-add',
                                                children:"{{$renderStockNameAdd()}}",
                                            },
                                        },
                                        {
                                            _visible: '{{$commonEditable()}}',
                                            name: 'btn',
                                            component: '::div',
                                            className: 'selectMoreName',
                                            children: {
                                                name: 'step00',
                                                component: 'Icon',
                                                type: 'ellipsis',
                                                borderRadius: '4px'
                                            },
                                            disabled: '{{data.disabled}}',
                                            onClick: '{{$btnClick(_rowIndex)}}',
                                        }
                                    ],
                                    _power: '({rowIndex})=>rowIndex',
                                },
                            },{
                                name: 'nameText',
                                component: 'DataGrid.Column',
                                columnKey: 'nameText',
                                flexGrow: 1,
                                _visible:"{{data.formstate==false}}",
                                width: 300,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '存货名称'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    component: 'DataGrid.TextCell',
                                    className: 'inputSelectClass',
                                    title:"{{data.form.details[_rowIndex].name}}",
                                    value: "{{data.form.details[_rowIndex].name}}",
                                    onChange: "{{function(e){$sf('data.form.details.' + _rowIndex + '.name', e.target.value)}}}",
                                    _power: '({rowIndex})=>rowIndex',
                                }
                            },{
                                name: 'guige',
                                component: 'DataGrid.Column',
                                columnKey: 'guige',
                                flexGrow: 1,
                                width: 75,
                                align:'left',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: 'dataGrid-tableHeader',
                                    children: '规格型号'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    component: 'DataGrid.TextCell',
                                    className: 'inputSelectClass',
                                    title:"{{data.form.details[_rowIndex].guige}}",
                                    value: "{{data.form.details[_rowIndex].guige}}",
                                    onChange: "{{function(e){$sf('data.form.details.' + _rowIndex + '.guige', e.target.value)}}}",
                                    _power: '({rowIndex})=>rowIndex',
                                }
                            },{
                                name: 'unit',
                                component: 'DataGrid.Column',
                                columnKey: 'unit',
                                flexGrow: 1,
                                width: 75,
                                align:'left',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: 'dataGrid-tableHeaderNoBoder',
                                    children: '单位'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    component:'DataGrid.TextCell',
                                    className: 'inputSelectClass',
                                    title:"{{data.form.details[_rowIndex].unit}}",
                                    value: "{{data.form.details[_rowIndex].unit}}",
                                    onChange: "{{function(e){$sf('data.form.details.' + _rowIndex + '.unit', e.target.value)}}}",
                                    _power: '({rowIndex})=>rowIndex',
                                }
                            },{
                                name: 'num',
                                component: 'DataGrid.Column',
                                columnKey: 'num',
                                _visible:'{{data.formstate}}',
                                flexGrow: 1,
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '数量'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    timeout: true,
                                    tip: true,
                                    precision: 6,
                                    interceptTab: true,
                                    component: "{{$commonEditable() ? 'Input.Number' : 'DataGrid.TextCell' }}",
                                    className: "{{ ( ( $isFocus(_ctrlPath) ? 'inputSelectonClick ' : 'inputSelectClass ') + ($canInputStyle()) + ' alignLeft' )}}",
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    onBlur: '{{$calc("quantity", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex})=>rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'alignLeft',
                                    title: '{{$sumColumn("quantity")}}',
                                    children: '{{$sumColumn("quantity")}}'
                                }
                            },{
                                name: 'numchange',
                                component: 'DataGrid.Column',
                                columnKey: 'numchange',
                                _visible:"{{data.formstate==false}}",
                                flexGrow: 1,
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '数量'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'left',
                                    timeout: true,
                                    tip: true,
                                    precision: 2,
                                    interceptTab: true,
                                    component: 'DataGrid.TextCell',
                                    className: 'inputSelectClass unInputCell',
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].quantity)}}",
                                    onChange: '{{$calc("quantity", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex})=>rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'mk-datagrid-cellContent-right',
                                    children: '{{$sumColumn("quantity")}}',
                                    title: '{{$sumColumn("quantity")}}',
                                },
                            },{
                                name: 'price',
                                component: 'DataGrid.Column',
                                columnKey: 'price',
                                flexGrow: 1,
                                _visible:'{{data.formstate }}',
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '单价'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'right',
                                    precision: 6,
                                    component: "{{$commonEditable() ? 'Input.Number' : 'DataGrid.TextCell' }}",
                                    timeout: true,
                                    tip: true,
                                    regex: '^([0-9]+)(?:\.[0-9]{1,6})?$', 
                                    // className: "{{$isFocus(_ctrlPath) ? 'inputSelectonClick unInputCell' : 'inputSelectClass unInputCell'}}",
                                    className: "{{ ( ( $isFocus(_ctrlPath) ? 'inputSelectonClick ' : 'inputSelectClass ') + ($canInputStyle()) )}}",
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    onBlur: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex})=>rowIndex',
                                },
                            },{
                                name: 'pricechange',
                                component: 'DataGrid.Column',
                                columnKey: 'pricechange',
                                _visible:"{{data.formstate==false}}",
                                flexGrow: 1,
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '单价'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'right',
                                    component:  'DataGrid.TextCell',
                                    className: 'inputSelectClass unInputCell',
                                    timeout: true,
                                    tip: true,
                                    regex: '^([0-9]+)(?:\.[0-9]{1,6})?$', 
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].price)}}",							
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].price)}}",
                                    _power: '({rowIndex})=>rowIndex',
                                },
                            },{
                                name: 'ybbalance',
                                component: 'DataGrid.Column',
                                columnKey: 'ybbalance',
                                flexGrow: 1,
                                _visible:'{{data.formstate }}',
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '金额'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'right',
                                    // style:{
                                    //     height: '100%',
                                    //     border: 'none',
                                    //     borderRadius: '0',
                                    //     textAlign: 'right'
                                    // },
                                    min:0,
                                    timeout: true,
                                    tip: true,
                                    precision: 2,
                                    interceptTab: true,
                                    component: "{{$commonEditable() ? 'Input.Number' : 'DataGrid.TextCell' }}",
                                    className: "{{ ( ( $isFocus(_ctrlPath) ? 'inputSelectonClick ' : 'inputSelectClass ') + ($canInputStyle()) )}}",
                                    // className: "{{ ( $isFocus(_ctrlPath) && $commonEditable() ) ? 'inputSelectonClick inputCell' : 'inputSelectClass inputCell'}}",
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    onBlur: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                                    _power: '({rowIndex})=>rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'mk-datagrid-cellContent-right',
                                    children: '{{$sumColumn("amount")}}',
                                    title: '{{$sumColumn("amount")}}'
                                },
                            },{
                                name: 'ybbalancechange',
                                component: 'DataGrid.Column',
                                columnKey: 'ybbalancechange',
                                flexGrow: 1,
                                width: 75,
                                _visible:"{{data.formstate==false}}",
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    className: "{{$commonEditable() && 'ant-form-item-required'}}",
                                    children: '金额'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'right',
                                    component: "DataGrid.TextCell",
                                    min:0,
                                    timeout: true,
                                    tip: true,
                                    precision: 2,
                                    interceptTab: true,
                                    className: 'inputSelectClass unInputCell', 
                                    value: "{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    title:"{{$quantityFormat(data.form.details[_rowIndex].amount,2)}}",
                                    _power: '({rowIndex})=>rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'mk-datagrid-cellContent-right',
                                    children: '{{$sumColumn("amount")}}',
                                    title: '{{$sumColumn("amount")}}'
                                },
                            },{
                                name: 'chNum',
                                component: 'DataGrid.Column',
                                columnKey: 'chNum',
                                flexGrow: 1,
                                width: 75,
                                align:'center',
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '冲回数量'
                                },
                                cell: {
                                    name: 'cell',
                                    align:'right',
                                    component: "DataGrid.TextCell",
                                    className: 'unInputCell',
                                    min:0,
                                    timeout: true,
                                    tip: true,
                                    precision: 2,
                                    interceptTab: true,
                                    value: "{{$formatSixFn(data.form.details[_rowIndex].chNum)}}",
                                    title:"{{$formatSixFn(data.form.details[_rowIndex].chNum)}}",
                                    _power: '({rowIndex})=>rowIndex',
                                },
                                footer: {
                                    name: 'footer',
                                    component: 'DataGrid.Cell',
                                    className: 'mk-datagrid-cellContent-right',
                                    children: '{{$sumColumn("chNum")}}',
                                    title: '{{$sumColumn("chNum")}}'
                                },
                            }
                        ]
                    }
                ]
            },
            {
                name: 'footer-btn',
                component: '::div',
                className: 'ttk-stock-app-inventory-assessment-add-footer-btn',
                children: [
                    {
                        name: 'nameItem',
                        component: '::div',
                        style:{
                            margin:'0px',
                            float: 'left',
                            margin: '6px 0 0 12px',
                        },
                        children: '{{"制单人：" + data.formList.operater}}'
                    },{
                    name: 'btnGroup',
                    component: '::div',
                    className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup',
                    children: [{
                        name: 'cancel',
                        component: 'Button',
                        className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
                        children: '取消',
                        onClick: '{{$onCancel}}'
                    }, {
                        // _visible: '{{$dateEditable()}}',
                        _visible: '{{$commonEditable()}}',
                        name: 'confirm',
                        component: 'Button',
                        className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
                        type: 'primary',
                        children: '保存',
                        onClick: "{{function(e){$save('save')}}}"
                    }, {
                        name: 'saveAndNew',
                        component: 'Button',
                        _visible: '{{ (!data.znzg && !data.isFrom) && $commonEditable()}}',
                        // _visible: '{{!data.other.moduleYW}}',
                        className: 'ttk-stock-app-inventory-assessment-add-footer-btn-btnGroup-item',
                        type: 'primary',
                        children: '保存并新增',
                        onClick: "{{function(e){$save('saveAndNew')}}}"
                    }]
                }]
            }
        ]
	}
}

export function getInitState() {
	return {
		data: {
            loading: false,
            isEdit: false,
            znzg:false,
            isFrom: false,
			formstate:true,
			listAll:{
				billBodyNum:'',
				billBodyYbBalance:''
			},
			formList:{
				state:true,
				code: '',
				name:'',
				cdate:'',
				supplierName:'',
				supplierId:'',
				operater: 'liucp',
			},
			form: {
				details: [
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail,
					blankDetail,
                ],
                cacheData: [],
			},
			other: {
				error:{},
			},
			basic:{
				enableDate:''
			}
		}
	}
}
export const blankDetail = {
	name: '',
	code: '',
	guige: '',
	unit: '',
	quantity: '',
	price: '',
	amount: '',
};