
// import moment from 'moment'
// export function getMeta() {
// 	return {
// 		name: 'root',
// 		component: 'Layout',
// 		className: 'app-purchase',
// 		children: [
//             {
//                 name: 'root-content',
//                 component: 'Layout',
//                 className: 'app-purchase-backgroundColor',
//                 children: [
//                     {
//                         name: 'ttk-stock-app-spin',
//                         className: 'ttk-stock-app-spin',
//                         component: '::div',
//                         _visible: '{{data.loading}}',
//                         children: {
//                             name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
//                             className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
//                             component: 'Spin',
//                             size: 'large',
//                             tip: '数据加载中......',
//                             delay: 10
//                         }
//                     },
//                     {
//                         name: 'header',
//                         component: '::div',
//                         style:{position:'relative',padding: '10px 10px 80px',overflow:'hidden'},
//                         className: 'app-purchase-header',
//                         children: [
//                             {
//                                 name:'left',
//                                 component:'::div',
//                                 children:[
//                                     {
//                                         name:'back',
//                                         component:'::div',
//                                         className:"back",
//                                         style:{
//                                             width:'30px',
//                                             height:'30px',
//                                             position: 'absolute',
//                                             top: '7px',
//                                             left: '10px',
//                                             zIndex: '9',
//                                             cursor: 'pointer'
//                                         },
//                                         onClick: '{{$back}}',
//                                     },
//                                     {
//                                         name: 'reinit',
//                                         component: '::div',
//                                         className: 'reinit',
//                                         children: [
//                                             {
//                                                 name: 'query',
//                                                 component: 'Button',
//                                                 type: 'primary',
//                                                 className: 'myhelloworld-button',
//                                                 onClick: '{{$generateVoucher}}',
//                                                 children: '生成凭证'
//                                             },
//                                             {
//                                                 name: 'query1',
//                                                 component: 'Button',
//                                                 type: 'primary',
//                                                 className: 'myhelloworld-button',
//                                                 disabled:'{{data.limit.stateNow}}',
//                                                 onClick: '{{$addType}}',
//                                                 children: '新增'
//                                             },
//                                             {
//                                                 name: 'batch3',
//                                                 component: 'Dropdown',
//                                                 overlay: {
//                                                     name: 'menu',
//                                                     component: 'Menu',
//                                                     onClick: '{{$moreActionOpeate}}',
//                                                     children: [
//                                                         {
//                                                             name: 'settlement',
//                                                             component: 'Menu.Item',
//                                                             disabled:'{{data.limit.stateNow}}',
//                                                             className: "app-asset-list-disposal",
//                                                             key: 'settlement',
//                                                             children: [
//                                                                 {
//                                                                     name:'settlementText',
//                                                                     // className: 'help-icon-container',
//                                                                     component: '::span',	
//                                                                     children: '删除单据'
//                                                                 },
//                                                                 {
//                                                                     name:'help-icon-container',
//                                                                     className: 'help-icon-container',
//                                                                     component: '::div',
//                                                                     style: {
//                                                                         display: "inline-block",
//                                                                         verticalAlign: "middle",
//                                                                         marginLeft: "8px"
//                                                                     },
//                                                                     children: '{{$renderHelp()}}'
//                                                                 },
//                                                             ]
//                                                         },
//                                                         {
//                                                             name: 'supplement',
//                                                             component: 'Menu.Item',
//                                                             className: "app-asset-list-disposal",
//                                                             key: 'delectPz',
//                                                             children: '删除凭证'
//                                                         },
//                                                     ]
//                                                 },
//                                                 children: {
//                                                     name: 'internal',
//                                                     component: 'Button',
//                                                     className: 'app-asset-list-header-more',
//                                                     children: [
//                                                         {
//                                                             name: 'word',
//                                                             component: '::span',
//                                                             children: '更多'
//                                                         }, 
//                                                         {
//                                                             name: 'more',
//                                                             component: 'Icon',
//                                                             type: 'down'
//                                                         }
//                                                     ]
//                                                 }
//                                             },
//                                         ]
//                                     },
//                                 ]
//                             },
//                             {
//                                 name: 'content',
//                                 component:'::div',
//                                 className:'app-purchase-title',
//                                 children:[
//                                     {
//                                         name: 'list',
//                                         component:'::span',
//                                         className:'ttk-stock-app-inventory-h2',
//                                         children:'采购入库序时簿'
//                                     },
//                                     {
//                                         name: 'inv-app-batch-sale-header',
//                                         component: '::div',
//                                         className: 'inv-app-batch-sale-header',
//                                         children: {
//                                             name: 'header-left',
//                                             className: 'header-left',
//                                             component: '::div',
//                                             children: [
//                                                 {
//                                                     name: 'header-filter-input',
//                                                     component: 'Input',
//                                                     className: 'inv-app-batch-sale-header-filter-input',
//                                                     type: 'text',
//                                                     placeholder: '请输入单据编号或存货名称',
//                                                     onChange: "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
//                                                     prefix: {
//                                                         name: 'search',
//                                                         component: 'Icon',
//                                                         type: 'search'
//                                                     }
//                                                 }, 
//                                                 {
//                                                     name: 'popover',
//                                                     component: 'Popover',
//                                                     popupClassName: 'inv-batch-sale-list-popover',
//                                                     placement: 'bottom',
//                                                     title: '',
//                                                     content: {
//                                                         name: 'popover-content',
//                                                         component: '::div',
//                                                         className: 'inv-batch-custom-popover-content',
//                                                         children: [
//                                                             {
//                                                                 name: 'filter-content',
//                                                                 component: '::div',
//                                                                 className: 'filter-content',
//                                                                 children: [
//                                                                     {
//                                                                         name: 'bill-date',
//                                                                         component: '::div',
//                                                                         className: 'inv-batch-custom-popover-item',
//                                                                         children: [
//                                                                             {
//                                                                                 name: 'label',
//                                                                                 component: '::span',
//                                                                                 children: '入库日期：',
//                                                                                 className: 'inv-batch-custom-popover-label',
//                                                                             }, 
//                                                                             {
//                                                                                 name: 'rangePicker',
//                                                                                 component: 'DatePicker.RangePicker',
//                                                                                 disabledDate: '{{$disabledDate}}',
//                                                                                 // defaultPickerValue:[moment("20191031", "YYYYMMDD"),moment("20191031", "YYYYMMDD")],
//                                                                                 defaultPickerValue: "{{[data.defaultPickerValue, data.defaultPickerValue]}}",
//                                                                                 value: "{{[$stringToMoment((data.form.strDate),'YYYY-MM-DD'), $stringToMoment((data.form.endDate),'YYYY-MM-DD')]}}",
//                                                                                 onChange: "{{function(v, arr){$sf('data.form.strDate', $momentToString(arr[0],'YYYY-MM-DD')); " +
//                                                                                     "$sf('data.form.endDate', $momentToString(arr[1],'YYYY-MM-DD'))}}}",
//                                                                                 allowClear: true,
//                                                                                 placeholder: "{{['开始日期', '结束日期']}}",
//                                                                                 className: 'popover-body-content-item-date',
//                                                                                 getCalendarContainer: '{{function(trigger) {return trigger.parentNode}}}',
//                                                                                 //value: "{{$stringToMoment((data.formContent.strDate),'YYYY-MM-DD')}}"
//                                                                             }
//                                                                         ]
//                                                                     },
//                                                                     {
//                                                                         name: 'popover-sale',
//                                                                         component: '::div',
//                                                                         className: 'inv-batch-custom-popover-item',
//                                                                         children: [
//                                                                             {
//                                                                                 name: 'label',
//                                                                                 component: '::span',
//                                                                                 children: '往来单位：',
//                                                                                 className: 'inv-batch-custom-popover-label'
//                                                                             }, 
//                                                                             {
//                                                                                 name: 'select',
//                                                                                 component: 'Select',
//                                                                                 className: 'inv-batch-custom-popover-option',
//                                                                                 showSearch: true,
//                                                                                 getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
//                                                                                 placeholder: "请选择",
//                                                                                 filterOption: '{{$filterIndustry}}',
//                                                                                 value: '{{data.form.constom}}',
//                                                                                 onSelect: "{{function(e){$sf('data.form.constom',e)}}}",
//                                                                                 children: '{{$getSelectOption()}}'
//                                                                             },
//                                                                         ]
//                                                                     },
//                                                                     {
//                                                                         name: 'popover-sale',
//                                                                         component: '::div',
//                                                                         className: 'inv-batch-custom-popover-item',
//                                                                         children: [
//                                                                             {
//                                                                                 name: 'label',
//                                                                                 component: '::span',
//                                                                                 children: '单据来源：',
//                                                                                 className: 'inv-batch-custom-popover-label'
//                                                                             }, 
//                                                                             {
//                                                                                 name: 'select',
//                                                                                 component: 'Select',
//                                                                                 className: 'inv-batch-custom-popover-option',
//                                                                                 showSearch: true,
//                                                                                 getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
//                                                                                 placeholder: "请选择",
//                                                                                 filterOption: '{{$filterIndustry}}',
//                                                                                 value: '{{data.form.typeName}}',
//                                                                                 onSelect: "{{function(e){$changeTypeSelect(e)}}}",
//                                                                                 children: '{{$renderTypeSelectOption()}}'
//                                                                             },
//                                                                         ]
//                                                                     },
//                                                                     {
//                                                                         name: 'popover-sale',
//                                                                         component: '::div',
//                                                                         className: 'inv-batch-custom-popover-item',
//                                                                         children: [
//                                                                             {
//                                                                                 name: 'label',
//                                                                                 component: '::span',
//                                                                                 children: '凭证状态：',
//                                                                                 className: 'inv-batch-custom-popover-label'
//                                                                             }, 
//                                                                             {
//                                                                                 name: 'select',
//                                                                                 component: 'Select',
//                                                                                 className: 'inv-batch-custom-popover-option',
//                                                                                 showSearch: true,
//                                                                                 getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
//                                                                                 placeholder: "请选择",
//                                                                                 filterOption: '{{$filterIndustry}}',
//                                                                                 value: '{{data.form.voucherName}}',
//                                                                                 onSelect: "{{function(e){$changeVoucherSelect(e)}}}",
//                                                                                 children: '{{$renderVoucherIdsSelectOption()}}'
//                                                                             },
//                                                                         ]
//                                                                     },
//                                                                 ]
//                                                             }, 
//                                                             {
//                                                                 name: 'filter-footer',
//                                                                 component: '::div',
//                                                                 className: 'filter-footer',
//                                                                 children: [
//                                                                     {
//                                                                         name: 'search',
//                                                                         component: 'Button',
//                                                                         type: 'primary',
//                                                                         children: '查询',
//                                                                         onClick: '{{$filterList}}'
//                                                                     },
//                                                                     {
//                                                                         name: 'reset',
//                                                                         className: 'reset-btn',
//                                                                         component: 'Button',
//                                                                         children: '重置',
//                                                                         onClick: '{{$resetForm}}'
//                                                                     }
//                                                                 ]
//                                                             }
//                                                         ]
//                                                     },
//                                                     trigger: 'click',
//                                                     visible: '{{data.showPopoverCard}}',
//                                                     onVisibleChange: "{{$handlePopoverVisibleChange}}",
//                                                     children: {
//                                                         name: 'filterSpan',
//                                                         component: '::span',
//                                                         className: 'inv-batch-custom-filter-btn header-item',
//                                                         children: {
//                                                             name: 'filter',
//                                                             component: 'Icon',
//                                                             type: 'filter'
//                                                         }
//                                                     }
//                                                 }
//                                             ]
//                                         },
//                                     },
//                                 ]
//                             },
//                         ]
//                     },
//                     {
//                         name: 'content',
//                         component: 'Layout',
//                         className: 'app-purchase-content',
//                         children: [
//                             {
//                                 name: 'dataGrid',
//                                 component: 'DataGrid',
//                                 ellipsis: true,
//                                 headerHeight: 37,
//                                 loading: '{{data.other.loading}}',
//                                 rowHeight: 37,
//                                 isColumnResizing: false,
//                                 rowsCount:'{{data.list.length}}',
//                                 columns: [
//                                     {
//                                         name: 'select',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'operation',
//                                         width: 34,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: [{
//                                                 name: 'chexkbox',
//                                                 component: 'Checkbox',
//                                                 checked: '{{$isSelectAll("dataGrid")}}',
//                                                 onChange: '{{$selectAll("dataGrid")}}'
//                                             }]
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             component: 'DataGrid.Cell',
//                                             tip: true,
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: [
//                                                 {
//                                                     name: 'select',
//                                                     component: 'Checkbox',
//                                                     checked: '{{data.list[_rowIndex].selected}}',
//                                                     onChange: '{{$selectRow(_rowIndex)}}'
//                                                 }
//                                             ]
//                                         }
//                                     },
//                                     {
//                                         name: 'code',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'code',
//                                         width: 150,
//                                         flexGrow: 1,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '单据编号'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: [ 
//                                                 {
//                                                     name: 'title',
//                                                     component: '::span',
//                                                     style:{
//                                                         color: '#009fff',
//                                                         cursor: 'pointer',
//                                                     },
//                                                     children: '{{data.list[_rowIndex].code}}',
//                                                     onClick: '{{$lock(data.list[_rowIndex].id, data.list[_rowIndex].invNo, data.list[_rowIndex].voucherIds, data.list[_rowIndex].type)}}',
//                                                 },
//                                                 {
//                                                     name: 'helpIcon',
//                                                     _visible: '{{data.list[_rowIndex].isBillBodyNumNull ? true : false}}',
//                                                     component: 'Icon',
//                                                     fontFamily: 'warning-icon',
//                                                     type: 'exclamation-circle',
//                                                     title: '数量为空，单价为空',
//                                                     className: 'warning-icon',
//                                                 }
//                                             ]
//                                         }
//                                     },
//                                     {
//                                         name: 'cdate',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'cdate',
//                                         width: 100,
//                                         flexGrow: 1,
//                                         align:'left',
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '入库日期'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'center',
//                                             component: 'DataGrid.Cell',
//                                             tip: true,
//                                             // className: 'mk-datagrid-cellContent-left',
//                                             className: '',
//                                             value: '{{data.list[_rowIndex].cdate}}',
//                                             _power: '({rowIndex})=>rowIndex'
//                                         }
//                                     }, 
//                                     {
//                                         name: 'customerName',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'customerName',
//                                         width: 120,
//                                         flexGrow: 1,
//                                         align:'left',
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '往来单位'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'left',
//                                             component: 'DataGrid.Cell',
//                                             tip: true,
//                                             // className: 'mk-datagrid-cellContent-left',
//                                             // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
//                                             value: '{{data.list[_rowIndex].supplierName}}',
//                                             _power: '({rowIndex})=>rowIndex'
//                                         }
//                                     },
//                                     {
//                                         name: 'savecode',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'savecode',
//                                         width: 100,
//                                         flexGrow: 1,
//                                         align:'left',
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '存货编号'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'left',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: '{{data.list[_rowIndex].inventoryCode}}'
//                                         }
//                                     },
//                                     {
//                                         name: 'inventoryName',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'inventoryName',
//                                         width: 120,
//                                         flexGrow: 1,
//                                         align:'left',
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '存货名称'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'left',
//                                             component: 'DataGrid.Cell',
//                                             tip: true,
//                                             // className: 'mk-datagrid-cellContent-left',
//                                             // className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
//                                             value: '{{data.list[_rowIndex].inventoryName}}',
//                                             _power: '({rowIndex})=>rowIndex'
//                                         }
//                                     },
//                                     {
//                                         name: 'billBodyNum',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'billBodyNum',
//                                         width: 90,
//                                         flexGrow: 1,
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '数量'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'right',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             _power: '({rowIndex})=>rowIndex',
//                                             value: "{{data.list[_rowIndex].billBodyNum}}",
//                                         }
//                                     }, 
//                                     {
//                                         name: 'price',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'price',
//                                         width: 90,
//                                         flexGrow: 1,
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '单价'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'right',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             value: "{{data.list[_rowIndex].billBodyPrice}}",
//                                             _power: '({rowIndex})=>rowIndex',
//                                         }
//                                     },
//                                     {
//                                         name: 'ybbalance',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'ybbalance',
//                                         width: 90,
//                                         flexGrow: 1,
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '金额'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             align:'right',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             value: "{{data.list[_rowIndex].billBodyYbBalance}}",
//                                             _power: '({rowIndex})=>rowIndex',
//                                         }
//                                     },
//                                     {
//                                         name: 'invNo',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'invNo',
//                                         width: 80,
//                                         flexGrow: 1,
//                                         align:'left',
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '发票号码'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             style: {
//                                                 color:'#009fff',
//                                                 cursor: 'pointer',
//                                             },
//                                             onClick:'{{$checkoutInvNo(data.list[_rowIndex])}}',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left',
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: '{{data.list[_rowIndex].invNo}}'
//                                         }
//                                     },
//                                     {
//                                         name: 'voucherCodes',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'voucherCodes',
//                                         width: 100,
//                                         flexGrow: 1,
//                                         // isResizable: true,
//                                         header: {
//                                             name: 'header',
//                                             component: 'DataGrid.Cell',
//                                             children: '凭证'
//                                         },
//                                         // cell: {
//                                         //     name: 'cell',
//                                         //     component: 'DataGrid.Cell',
//                                         //     style: {
//                                         //         color:'#009fff',
//                                         //         cursor: 'pointer',
//                                         //     },
//                                         //     className: 'mk-datagrid-cellContent-left',
//                                         //     onClick:'{{$checkoutVoucher(data.list[_rowIndex].voucherIds)}}',
//                                         //     _power: '({rowIndex})=>rowIndex',
//                                         //     children: '{{data.list[_rowIndex].voucherCodes}}'
//                                         // }
//                                         cell: {
//                                             name: 'cell',
//                                             component: 'DataGrid.Cell',
//                                             className: 'mk-datagrid-cellContent-left titledelect',
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: [ 
//                                                 {
//                                                     name: 'title',
//                                                     component: '::span',
//                                                     style:{
//                                                         color:'#009fff',
//                                                         cursor: 'pointer',
//                                                     },
//                                                     children: '{{data.list[_rowIndex].voucherCodes}}',
//                                                     onClick:'{{$checkoutVoucher(data.list[_rowIndex].voucherIds)}}',
//                                                 },
//                                                 {
//                                                     name: 'helpIcon',
//                                                     _visible:'{{data.list[_rowIndex].voucherCodes ? true : false}}',
//                                                     component: 'Icon',
//                                                     fontFamily: 'del-icon',
//                                                     type: 'close-circle',
//                                                     className:'del-icon',
//                                                     onClick:'{{$delectOnly(data.list[_rowIndex])}}',
//                                                 }
//                                             ]
//                                         }
//                                     },
//                                     {
//                                         name: 'operation',
//                                         component: 'DataGrid.Column',
//                                         columnKey: 'operation',
//                                         width: 100,
//                                         header: {
//                                             name: 'header',
//                                             fixed: 'right',
//                                             component: 'DataGrid.Cell',
//                                             children: '操作'
//                                         },
//                                         cell: {
//                                             name: 'cell',
//                                             fixed: 'right',
//                                             component: 'DataGrid.Cell',
//                                             style: { display: 'flex' },
//                                             _power: '({rowIndex})=>rowIndex',
//                                             children: [{
//                                                 name: 'remove',
//                                                 component: '::span',
//                                                 disabled: '{{data.limit.stateNow}}',
//                                                 className: "{{data.limit.stateNow?'spanNoselect':'spanselect'}}",
//                                                 style: {
//                                                     fontSize: 14,
//                                                     cursor: 'pointer',
//                                                     paddingRight: '5px',
//                                                 },
//                                                 children: '删除',
//                                                 onClick: '{{$delClick(data.list[_rowIndex].id, data.list[_rowIndex].invNo, data.list[_rowIndex].voucherIds)}}'
//                                             }]
//                                         }
//                                     }
//                                 ]
//                             }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 name: 'footer',
//                 component: '::div',
//                 className: 'app-purchase-footer',
//                 style: {paddingRight:'20px', position:'relative'},
//                 children: [
//                     {
//                         name:'total',
//                         component:'::div',
//                         style: {position:'absolute', left:'20px'},
//                         children: [
//                             {
//                                 name:'totalTxt',
//                                 component:'::span',
//                                 style: {fontSize:'14px', paddingRight:'14px'},
//                                 children:'合计'
//                             },
//                             {
//                                 name:'totalNum',
//                                 component:'::span',
//                                 style: {fontSize:'14px'},
//                                 children:'数量:   '
//                             },
//                             {
//                                 name:'totalNumV',
//                                 component:'::span',
//                                 style: {fontSize:'14px', paddingRight:'14px'},
//                                 children:'{{data.listAll.billBodyNum}}'
//                             },
//                             {
//                                 name:'totalPrice',
//                                 component:'::span',
//                                 style: {fontSize:'14px'},
//                                 children:'金额:  '
//                             },
//                             {
//                                 name:'totalPriceV',
//                                 component:'::span',
//                                 style: {fontSize:'14px'},
//                                 children:'{{data.listAll.billBodyYbBalance}}'
//                             }
//                         ]
//                     },
//                     {
//                         name: 'pagination',
//                         component: 'Pagination',
//                         showSizeChanger: true,
//                         pageSize: '{{data.pagination.pageSize}}',
//                         current: '{{data.pagination.current}}',
//                         total: '{{data.pagination.total}}',
//                         onChange: '{{$pageChanged}}',
//                         showTotal: '{{$pageShowTotal}}',
//                         onShowSizeChange: '{{$pageChanged}}'
//                     }
//                 ]
//             },
// 	    ]
// 	}
// }

// export function getInitState() {
// 	return {
// 		data: {
//             aaa: true,
//             loading: false,
//             list: [],
// 			limit: {
// 				stateNow: '',
// 			},
// 			listAll: {
// 				billBodyNum: '0',
// 				billBodyYbBalance: '0',
// 			},
// 			defaultPickerValue: '',
// 			pagination: {
// 				pageSize: 50,
// 				current: 1,
// 				total: 0,
// 			},
// 			inputVal: '',
// 			other: {
// 				activeTabKey: '1',
// 				isShowFirstTab: true,
// 			},
// 			form: {
//                 type: null,
//                 typeName: '',
// 				strDate: '',
// 				endDate: '',
//                 constom: '',
//                 voucherIds: null,
//                 voucherName: ''
// 			},	
// 		}
// 	}
// }
export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'app-purchase',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}