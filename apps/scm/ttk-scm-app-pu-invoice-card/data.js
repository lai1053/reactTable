import { consts, common } from 'edf-constant'
import moment from 'moment'
import { fromJS } from 'immutable'

export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-scm-app-pu-invoice-card',
        id: 'ttk-scm-app-pu-invoice-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-scm-app-pu-invoice-card-header',
            children: [{
                name: 'left',
                component: 'Layout',
                className: 'ttk-scm-app-pu-invoice-card-header-left',
                children: [{
                    name: 'page',
                    component: 'Button.Group',
                    className: 'page-prev-next',
                    children: [{
                        name: 'prev',
                        component: 'Button',
                        icon: 'left',
                        title: '上一张',
                        disabled: '{{data.other.prevDisalbed}}',
                        onClick: '{{$prev}}'
                    }, {
                        name: 'next',
                        component: 'Button',
                        icon: 'right',
                        title: '下一张',
                        disabled: '{{data.other.nextDisalbed}}',
                        onClick: '{{$next}}'
                    }]
                }, {
                    name: 'setting',
                    component: 'Icon',
                    className: 'btn setting',
                    fontFamily: 'edficon',
                    type: 'shezhi',
                    title: '设置',
                    onClick: '{{$setting}}'
                }]
            }, {
                name: 'right',
                component: 'Layout',
                className: 'ttk-scm-app-pu-invoice-card-header-right',
                children: [{
                    name: 'shortcut',
                    component: 'Popover',
                    placement: "bottom",
                    overlayClassName: 'ttk-scm-app-pu-invoice-card-header-left-jianpan',
                    arrowPointAtCenter: true,
                    content: {
                        name: 'keys',
                        component: 'ShortKey',
                        shortCuts: [
                            {
                                code: 1,
                                name: 'Ctrl + Alt + n',
                                keyCode: [17, 18, 78],
                                className: 'show_style1',
                                detail: '新增'
                            }, {
                                code: 2,
                                name: 'Ctrl + s',
                                keyCode: [17, 83],
                                className: 'show_style2',
                                detail: '保存'
                            }, {
                                code: 3,
                                name: 'Ctrl + /',
                                keyCode: [17, 191],
                                className: 'show_style3',
                                detail: '保存并新增'
                            }, {
                                code: 4,
                                name: 'Ctrl + y',
                                keyCode: [17, 89],
                                className: 'show_style4',
                                detail: '生成凭证/删除凭证'
                            },
                            {
                                code: 6,
                                name: 'Ctrl + 【',
                                keyCode: [17, 219],
                                className: 'show_style6',
                                detail: '上一张发票'
                            }, {
                                code: 7,
                                name: 'Ctrl + 】',
                                keyCode: [17, 221],
                                className: 'show_style7',
                                detail: '下一张发票'
                            }, {
                                code: 8,
                                name: 'Enter',
                                keyCode: [13],
                                className: 'show_style7',
                                detail: '下一个/下一行'
                            }
                        ],
                    },
                    title: null,
                    children: {
                        component: 'Icon',
                        className: 'ttk-scm-app-pu-invoice-card-header-left-iconbutton',
                        fontFamily: 'edficon',
                        type: 'jianpan',
                        title: '快捷键',
                    }
                }, {
                    name: 'adds',
                    component: 'Button',
                    className: 'ttk-scm-app-pu-invoice-card-header-right-but',
                    onClick: '{{function(){$initLoad(null)}}}',
                    // _visible: '{{data.other.auditVisible || !!data.form.discarded}}',
                    _visible: '{{data.other.auditVisible}}',
                    children: '新增'
                }, {
                    name: 'add',
                    component: 'Button',
                    className: 'ttk-scm-app-pu-invoice-card-header-right-but',
                    onClick: '{{function(){$save(true)}}}',
                    // _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                    _visible: '{{!data.other.auditVisible}}',
                    children: '保存并新增'
                }, {
                    name: 'save',
                    component: 'Button',
                    onClick: '{{function(){$save(false)}}}',
                    _visible: '{{!data.other.auditVisible}}',
                    // _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                    children: '保存'
                }, {
                    name: 'audit',
                    component: 'Button',
                    // disabled: '{{data.other.pageStatus === data.consts.pageStatus.ADD}}',
                    disabled: '{{$getDiscarded()}}',
                    onClick: '{{$audit}}',
                    _visible: '{{$notMinfei()&&data.other.auditVisible}}',
                    children: '{{$getAuditBtnText()}}'
                    // children:'审核'
                }, {
                    name: 'history',
                    component: 'Button',
                    onClick: '{{$history}}',
                    children: '历史单据'
                }, {
                    name: 'more',
                    component: 'Dropdown',
                    overlay: {
                        name: 'menu',
                        component: 'Menu',
                        onClick: '{{$moreMenuClick}}',
                        children: [{
                            name: 'del',
                            component: 'Menu.Item',
                            key: 'del',
                            disabled: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved || !data.other.auditVisible}}',
                            children: {
                                name: 'delSpan',
                                component: '::span',
                                style: { fontSize: '12px' },
                                children: '删除'
                            }
                        }, {
                            name: 'deductions',
                            component: 'Menu.Item',
                            key: 'deductions',
                            disabled: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                            children: '扣除额'
                        }, {
                            name: 'pay',
                            component: 'Menu.Item',
                            key: 'pay',
                            _visible: `{{$isTvoucher()}}`,
                            disabled: `{{data.other.pageStatus === data.consts.pageStatus.ADD}}`,
                            children: {
                                name: 'paySpan',
                                component: '::span',
                                style: { fontSize: '12px' },
                                children: '付款'
                            }
                        }]
                    },
                    children: {
                        name: 'internal',
                        component: 'Button',
                        children: ['更多', {
                            name: 'down',
                            component: 'Icon',
                            type: 'down'
                        }]
                    }
                }]
            }]
        }, {
            name: 'content',
            component: '::div',
            className: 'ttk-scm-app-pu-invoice-card-content',
            children: [{
                name: 'title',
                component: 'Layout',
                className: 'ttk-scm-app-pu-invoice-card-title',
                children: [
                    {
                        name: 'left',
                        component: 'Layout',
                        className: 'ttk-scm-app-pu-invoice-card-title-left',
                        children: [{
                            component: '::div',
                            className: 'ttk-scm-app-pu-invoice-card-title-left-span',
                            // _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                            _visible: '{{data.other.accountStatus == 4000140002}}',
                            children: [{
                                name: 'zihao',
                                component: '::span',
                                children: '凭证字号:'
                            }, {
                                name: 'code',
                                component: '::span',
                                className: 'code',
                                style: { marginLeft: 10 },
                                // children: "{{'记-'+data.form.docCode || ''}}",
                                children: "{{$renderPZZH()}}",
                                onClick: '{{function() {$openDocContent()}}}',
                                _visible: '{{data.other.accountStatus == 4000140002}}',
                                // _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                            }]
                        }]
                    }, {
                        name: 'center',
                        component: '::div',
                        className: 'ttk-scm-app-pu-invoice-card-title-center',
                        children: {
                            name: 'title',
                            component: '::h1',
                            // style: { fontWeight: 'bold' },
                            children: '进项发票'
                        }
                    }, {
                        name: 'right',
                        component: 'Layout',
                        className: 'ttk-scm-app-pu-invoice-card-title-right',
                        children: [{
                            name: 'zi',
                            component: '::span',
                            children: '单据编号:',
                            _visible: `{{!(data.other.pageStatus === data.consts.pageStatus.ADD
                                || data.form.receiveAmount == data.form.taxInclusiveAmount)
                            }}`,
                        }, {
                            name: 'code',
                            component: '::div',
                            className: 'code',
                            style: { marginRight: 10 },
                            _visible: `{{!(data.other.pageStatus === data.consts.pageStatus.ADD
                                || data.form.receiveAmount == data.form.taxInclusiveAmount)
                            }}`,
                            children: "{{data.form.code || ''}}"
                        }, {
                            name: 'attachmentItem',
                            component: 'Attachment',
                            status: '{{data.other.accountStatus == 4000140002 ? 1 : 0}}',
                            // status: '{{data.form.attachmentStatus}}',    
                            data: '{{data.form.attachmentFiles}}',
                            onDownload: '{{$download}}',
                            loading: '{{data.form.attachmentLoading}}',
                            visible: '{{data.form.attachmentVisible}}',
                            onDel: '{{$delFile}}',
                            uploadProps: {
                                disabled: '{{!!(data.form.status == data.consts.VOUCHERSTATUS_Approved)}}',
                                action: '/v1/edf/file/upload', //上传地址,
                                headers: '{{$getAccessToken()}}',
                                accept: '', //接受的上传类型
                                data: { "fileClassification": "ATTACHMENT" },
                                onChange: '{{$attachmentChange}}',
                                beforeUpload: '{{$beforeUpload}}'
                            }
                        }]
                    }, {
                        name: 'audited',
                        component: '::img',
                        className: 'ttk-scm-app-pu-invoice-card-img',
                        src: './vendor/img/scm/audited.png',
                        _visible: '{{data.other.accountStatus == 4000140002 ? true : false}}'
                        // _visible: '{{(!data.form.discarded && data.other.accountStatus == 4000140002) ? true : false}}'
                        // _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved  && !data.form.discarded}}'
                    }, /*{
                        name: 'aband',
                        component: '::img',
                        className: 'ttk-scm-app-pu-invoice-card-img1',
                        src: require('./img/aband.png'),
                        _visible: '{{data.form.discarded || false}}'
                    }*/]
            }, {
                name: 'formHeader',
                component: 'Form',
                className: 'ttk-scm-app-pu-invoice-card-form-header',
                // children: '{{$renderFormContent()}}'
                children: [{
                    name: 'c1',
                    component: 'Form.Item',
                    label: '单据日期',
                    className: 'businessDate_container',
                    validateStatus: "{{data.error.businessDate ? 'error' : 'success'}}",
                    required: true,
                    children: {
                        name: 'd1',
                        component: 'DatePicker',
                        className: 'autoFocus_item',
                        value: "{{$stringToMoment(data.form.businessDate)}}",
                        autoFocus: true,
                        disabled: '{{$getDisable()}}',
                        disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
                        getCalendarContainer: "{{function(){return document.getElementsByClassName('businessDate_container')[0]}}}",
                        onChange: `{{function(v){$handleChange('data.form.businessDate',$momentToString(v, "YYYY-MM-DD"))}}}`,
                    }
                }, {
                    name: 'c2',
                    component: 'Form.Item',
                    label: '发票类型',
                    required: true,
                    validateStatus: "{data.error.invoiceType ? 'error' : 'success'}",
                    children: [{
                        name: 'invoiceType',
                        component: 'Select',
                        className: 'autoFocus_item',
                        showSearch: false,
                        disabled: '{{$getDisable()}}',
                        value: '{{data.form.invoiceTypeId}}',
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.invoiceTypeId", name: "data.form.invoiceTypeName" },"data.other.invoiceType",null,null,null,null,null,v)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.invoiceType && data.other.invoiceType[_rowIndex].id }}',
                            children: '{{data.other.invoiceType && data.other.invoiceType[_rowIndex].name }}',
                            _power: 'for in data.other.invoiceType'
                        },
                    }, {
                        name: 'popover',
                        component: 'Popover',
                        content: '增值税专用发票，机动车销售发票，税局代开增值税发票归类到增值税专用发票中，农产品销售发票，统一收购发票归类到农产品销售发票中',
                        placement: 'rightTop',
                        overlayClassName: 'ttk-scm-app-sa-invoice-card-helpPopover',
                        children: {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'helpIcon'
                        }
                    }]
                }, {
                    name: 'c3',
                    component: 'Form.Item',
                    label: '销方名称',
                    validateStatus: "{{data.error.supplier ? 'error' : 'success'}}",
                    required: true,
                    children: [{
                        name: 'supplier',
                        component: 'Select',
                        className: 'autoFocus_item',
                        placeholder: '按名称/拼音/编码搜索',
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '225px' },
                        autoFocus: true,
                        disabled: '{{$getDisable()}}',
                        onFocus: '{{function(){$getSupplier({ entity: { isEnable: true } }, "data.other.supplier")}}}',
                        filterOption: '{{function(v,option){return $filterOptionArchives("supplier",v,option)}}}',
                        // value: '{{$renderInventoryName(String(data.form.supplierId), "data.other.supplier", data.form.supplierName)}}',
                        value: '{{$getDisable() ? data.form.supplierName : (data.form.supplierId ? data.form.supplierId : data.form.supplierName)}}',
                        onChange: `{{function(v){$onFieldChange({ id: "data.form.supplierId", name: "data.form.supplierName" },"data.other.supplier",null,null,null,null, null,v)}}}`,
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            key: '{{data.other.supplier && data.other.supplier[_rowIndex].id }}',
                            value: '{{data.other.supplier && data.other.supplier[_rowIndex].id }}',
                            title: '{{data.other.supplier && data.other.supplier[_rowIndex].code +" "+ data.other.supplier[_rowIndex].name}}',
                            children: '{{data.other.supplier && data.other.supplier[_rowIndex].code +" "+ data.other.supplier[_rowIndex].name}}',
                            _power: 'for in data.other.supplier'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('supplier')}}}"
                        },
                    }]
                }, {
                    name: 'c4',
                    component: 'Form.Item',
                    label: '发票代码',
                    validateStatus: "{{data.error.invoiceCode ? 'error' : 'success'}}",
                    children: [{
                        name: 'invoiceCode',
                        component: 'Input',
                        className: 'autoFocus_item',
                        timeout: true,
                        value: "{{data.form.invoiceCode}}",
                        maxLength: "{{data.form.invoiceTypeId != 4000010040 ? 12 : ''}}",
                        disabled: '{{$getDisable()}}',
                        onChange: `{{function(e){$handleChange("data.form.invoiceCode", e.target.value)}}}`,
                    }]
                }, {
                    name: 'c5',
                    component: 'Form.Item',
                    label: '发票号码',
                    validateStatus: "{{data.error.invoiceNumber ? 'error' : 'success'}}",
                    children: [{
                        name: 'invoiceCode',
                        component: 'Input',
                        className: 'autoFocus_item',
                        value: "{{data.form.invoiceNumber}}",
                        maxLength: "{{data.form.invoiceTypeId != 4000010040 ? 8 : ''}}",
                        timeout: true,
                        disabled: '{{$getDisable()}}',
                        onChange: `{{function(e){$handleChange("data.form.invoiceNumber", e.target.value)}}}`,
                    }]
                }, {
                    name: 'c6',
                    component: 'Form.Item',
                    label: '开票日期',
                    className: 'invoiceDate_container',
                    required: true,
                    children: {
                        name: 'invoiceDate',
                        component: 'DatePicker',
                        className: 'autoFocus_item',
                        value: "{{$stringToMoment(data.form.invoiceDate)}}",
                        disabled: '{{$getDisable()}}',
                        disabledDate: '{{function(value){return $handleDisInvoiceDate(value)}}}',
                        getCalendarContainer: "{{function(){return document.getElementsByClassName('invoiceDate_container')[0]}}}",
                        onChange: `{{function(v){$handleChange('data.form.invoiceDate',$momentToString(v, "YYYY-MM-DD"))}}}`,
                    }
                }, {
                    name: 'c7',
                    component: 'Form.Item',
                    label: '部门',
                    _visible: '{{$handleVisible("department")}}',
                    children: [{
                        name: 'department',
                        component: 'Select',
                        upName: 'Department',
                        className: 'autoFocus_item',
                        placeholder: '按名称/拼音/编码搜索',
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '225px' },
                        autoFocus: true,
                        showSearch: true,
                        // allowClear: true,
                        allowClear: '{{ data.form.departmentId ? true : false}}',
                        filterOption: '{{function(v,option){return $filterOptionArchives("department",v,option)}}}',
                        disabled: '{{$getDisable()}}',
                        onFocus: '{{function(){$getDepartment({ entity: { isEnable: true } }, "data.other.department")}}}',
                        value: '{{$renderInventoryName(String(data.form.departmentId), "data.other.department",data.form.departmentName)}}',
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.departmentId", name: "data.form.departmentName" },"data.other.department",null,null,null,null,null,v)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            // value: '{{data.other.department && data.other.department[_rowIndex].id }}',
                            key: '{{data.other.department && data.other.department[_rowIndex].id }}',
                            children: '{{data.other.department && data.other.department[_rowIndex].code + " " +data.other.department[_rowIndex].name }}',
                            _power: 'for in data.other.department'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('department')}}}"
                        },
                    }]
                }, {
                    name: 'c8',
                    component: 'Form.Item',
                    _visible: '{{$handleVisible("project")}}',
                    label: '项目',
                    children: [{
                        name: 'project',
                        component: 'Select',
                        upName: 'Project',
                        className: 'autoFocus_item',
                        placeholder: '按名称/拼音/编码搜索',
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '160px' },
                        autoFocus: true,
                        showSearch: true,
                        // allowClear: true,
                        allowClear: '{{ data.form.projectId ? true : false}}',
                        filterOption: '{{function(v,option){return $filterOptionArchives("project",v,option)}}}',
                        disabled: '{{$getDisable()}}',
                        onFocus: '{{function(){$getProject({ entity: { isEnable: true } }, "data.other.project")}}}',
                        value: '{{$renderInventoryName(String(data.form.projectId), "data.other.project",data.form.projectName)}}',
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.projectId", name: "data.form.projectName" },"data.other.project",null,null,null,null,null,v)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            key: '{{data.other.project && data.other.project[_rowIndex].id }}',
                            children: '{{data.other.project && data.other.project[_rowIndex].code + " " +data.other.project[_rowIndex].name }}',
                            _power: 'for in data.other.project'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('project')}}}"
                        }
                    }]
                }, {
                    name: 'c9',
                    component: 'Form.Item',
                    label: '备注',
                    _visible: '{{$handleVisible("remark")}}',
                    className: 'app-pu-invoice-card-form-header-remark',
                    children: {
                        name: 'remark',
                        className: 'autoFocus_item',
                        component: 'Input',
                        timeout: true,
                        value: "{{data.form.remark}}",
                        title: "{{data.form.remark}}",
                        disabled: '{{$getDisable()}}',
                        onChange: '{{function(e){$handleChange("data.form.remark", e.target.value)}}}',
                    }
                }]
            }, {
                name: 'details',
                component: 'DataGrid',
                className: 'ttk-scm-app-pu-invoice-card-form-details',
                id: 'ttk-scm-app-pu-invoice-card-form-details',
                headerHeight: 35,
                rowHeight: 35,
                footerHeight: 35,
                rowsCount: '{{data.form.details.length}}',
                enableSequence: true,
                startSequence: 1,
                // enableSequenceAddDelrow: true,
                // enableSequenceAddDelrow: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY ? false : true}}',
                enableSequenceAddDelrow: '{{data.other.accountStatus == 4000140002 ? false : true}}',
                sequenceFooter: {
                    name: 'footer',
                    component: 'DataGrid.Cell',
                    tip: true,
                    children: '合计',
                },
                // key: '{{data.other.detailHeight}}',
                key: '{{$renderKey()}}',
                // key: '{{data.form.id}}',
                readonly: false,
                style: '{{{return{height: data.other.detailHeight}}}}',
                onAddrow: "{{$addRow('details')}}",
                onDelrow: "{{$delRow('details')}}",
                onKeyDown: '{{$gridKeydown}}',
                scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                scrollToRow: '{{data.other.detailsScrollToRow}}',
                ellipsis: true,
                columns: [
                    //     {
                    //     name: 'inventoryCode',
                    //     component: 'DataGrid.Column',
                    //     columnKey: 'inventoryCode',
                    //     flexGrow: 1,
                    //     width: 140,
                    //     _visible: true,
                    //     header: {
                    //         name: 'header',
                    //         className: 'ant-form-item-required',
                    //         component: 'DataGrid.Cell',
                    //         children: '税收分类编码'
                    //     },
                    //     cell: {
                    //         name: 'cell',
                    //         component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                    //         className: '{{$getCellClassName(_ctrlPath)}}',
                    //         showSearch: true,
                    //         value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].taxClassificationId}}',
                    //         onChange: '{{$onFieldChange({ taxClassificationId: `data.form.details.${_rowIndex}.taxClassificationId`,' +
                    //         'id: `data.form.details.${_rowIndex}.inventoryId`,' +
                    //         'name: `data.form.details.${_rowIndex}.inventoryName`,' +
                    //         'code: `data.form.details.${_rowIndex}.code`,' +
                    //         'unitId: `data.form.details.${_rowIndex}.unitId`,' +
                    //         'unitName: `data.form.details.${_rowIndex}.unitName`,' +
                    //         'propertyId: `data.form.details.${_rowIndex}.propertyId`,' +
                    //         'propertyName: `data.form.details.${_rowIndex}.propertyName`,' +
                    //         'propertyDetailName: `data.form.details.${_rowIndex}.propertyDetailName`,' +
                    //         'taxRateName: `data.form.details.${_rowIndex}.taxRateName`,' +
                    //         'specification: `data.form.details.${_rowIndex}.specification`}, "data.other.inventory",_rowIndex, data.form.details[_rowIndex])}}',
                    //         filterOption: '{{$filterOption}}',
                    //         onFocus: '{{function(){$getInventory({}, `data.other.inventory`)}}}',
                    //         // dropdownFooter:"{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                    //         children: {
                    //             name: 'option',
                    //             component: 'Select.Option',
                    //             value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                    //             children: '{{data.other.inventory && data.other.inventory[_lastIndex].taxClassificationId}}',
                    //             _power: 'for in data.other.inventory'
                    //         },
                    //         _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                    //         _power: '({rowIndex})=>rowIndex',
                    //     }
                    // },
                    {
                        name: 'propertyName',
                        component: 'DataGrid.Column',
                        columnKey: 'propertyName',
                        flexGrow: 1,
                        width: 102,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '业务类型'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            showSearch: false,
                            allowClear: true,
                            align: 'left',
                            dropdownMatchSelectWidth: false,
                            // dropdownStyle:{width:'189px'}, 
                            // className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-center'+ ' focusSelect'}}",
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].propertyName ? {border: '1px solid red'} : {}}}",
                            className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-center'+ ' focusSelect'}}",
                            value: '{{$getDisable() ? data.form.details[_rowIndex].propertyName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].propertyId : data.form.details[_rowIndex].propertyName}}',
                            // onChange: '{{$onFieldChangePro({propertyId:`data.form.details.${_rowIndex}.propertyId`, propertyName:`data.form.details.${_rowIndex}.propertyName`},"data.other.properties", _rowIndex, data.form.details[_rowIndex],"propertyId")}}',
                            onChange: '{{$onFieldChangePro(null,"data.other.properties",_rowIndex,data.form.details[_rowIndex],"propertyId")}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                key: '{{data.other.properties && data.other.properties[_lastIndex].propertyId}}',
                                value: '{{data.other.properties && data.other.properties[_lastIndex].propertyId}}',
                                children: '{{data.other.properties && data.other.properties[_lastIndex].propertyName}}',
                                _power: 'for in data.other.properties'
                            },
                            // filterOption: '{{$filterOption}}',
                            _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    },
                    {
                        name: 'inventoryName',
                        component: 'DataGrid.Column',
                        columnKey: 'inventoryName',
                        flexGrow: 1,
                        width: 138,
                        header: {
                            name: 'header',
                            // className: 'ant-form-item-required',
                            className: "{{data.form.voucherSource =='4000090002' ? '' : 'ant-form-item-required'}}",
                            component: 'DataGrid.Cell',
                            children: '存货名称'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-center'+ ' focusSelect'}}",
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].inventory ? {border: '1px solid red'} : {}}}",
                            showSearch: true,
                            enableTooltip: false,
                            allowClear: true,
                            isNeedAdd:true,
                            // lazyload:true,
                            dropdownMatchSelectWidth: false,
                            // dropdownClassName: 'ttk-scm-app-pu-invoice-card-dropdownname',
                            // dropdownClassNameCopy: 'ttk-scm-app-pu-invoice-card-dropdownnamecopy',
                            lazyload:"{{data.other.inventorys.length>200 ? true : false}}",
                            dropdownClassName: "{{data.other.inventorys.length>200 ? 'ttk-scm-app-pu-invoice-card-dropdownname' : 'ttk-scm-app-sa-invoice-card-dropdownnamecopy'}}",
                            dropdownClassNameCopy: 'ttk-scm-app-sa-invoice-card-dropdownnamecopy',
                            dropdownStyle: { width: '300px' },
                            align: 'left',
                            value: `{{$getDisable() ? (data.form.details[_rowIndex].businessTypeName||data.form.details[_rowIndex].inventoryName) : 
                            $isFocus(_ctrlPath) ? 
                            data.form.details[_rowIndex] && 
                            $renderInventoryName((data.form.details[_rowIndex].businessTypeId || data.form.details[_rowIndex].inventoryId),"data.other.inventory",(data.form.details[_rowIndex].businessTypeName || data.form.details[_rowIndex].inventoryName)) : 
                            (data.form.details[_rowIndex].businessTypeName || data.form.details[_rowIndex].inventoryName)}}`,
                            title:'{{$renderInventoryTitle((data.form.details[_rowIndex].businessTypeId || data.form.details[_rowIndex].inventoryId),"data.other.inventory",(data.form.details[_rowIndex].businessTypeName || data.form.details[_rowIndex].inventoryName))}}',
                            // onChange:'{{$onFieldChange(null,"data.other.inventory",_rowIndex,data.form.details[_rowIndex],null)}}',  
                            onChange: '{{function(v){$onFieldChange(null,"data.other.inventory",_rowIndex,data.form.details[_rowIndex],null,null,null,v)}}}',
                            filterOption: '{{$filterOption}}',
                            onFocus: '{{function(){$getFocusInventory(_rowIndex, data.form.details[_rowIndex])}}}',
                            // dropdownFooter:"{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                            dropdownFooter: {
                                name: 'add',
                                component: 'Button',
                                type: 'primary',
                                style: { width: '100%', borderRadius: '0' },
                                children: '新增',
                                onClick: "{{function(){$addArchive('inventory', _rowIndex, data.form.details[_rowIndex])}}}"
                            }, 
                            addFooterClick:'{{function(){$addArchive("inventory", _rowIndex, data.form.details[_rowIndex])}}}',
                            children: '{{$renderSelectOption(_rowIndex, data.form.details[_rowIndex])}}',
                            _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    },
                    {
                        name: 'invoiceInvName',
                        component: 'DataGrid.Column',
                        columnKey: 'invoiceInvName',
                        flexGrow: 1,
                        width: 120,
                        _visible: '{{$getColumnVisible("invoiceInvName")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '{{$getColumnCaption("invoiceInvName")}}',
                        },
                        cell: {
                            name: 'cell',
                            align: 'left',
                            disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                            component: 'DataGrid.TextCell',
                            className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-disabled ttk-scm-app-sa-invoice-card-cell-center'}}",
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceInvName}}',
                            title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceInvName}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    },
                    {
                        name: 'inventoryRelatedAccountName',
                        component: 'DataGrid.Column',
                        columnKey: 'inventoryRelatedAccountName',
                        flexGrow: 1,
                        width: 114,
                        _visible: '{{$getColumnVisible("inventoryRelatedAccountName")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{$getColumnCaption("inventoryRelatedAccountName")}}',
                            className: 'ant-form-item-required'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath)}}',
                            showSearch: true,
                            enableTooltip: true,
                            allowClear: true,
                            align: 'left',
                            filterOption: '{{$filterOptionSubject}}',
                            dropdownMatchSelectWidth: false,
                            dropdownStyle: { width: '225px' },
                            // value: `{{data.form.details[_rowIndex] && 
                            //     ($getDisable() ? data.form.details[_rowIndex].inventoryRelatedAccountName:
                            //     $isFocus(_ctrlPath) ? data.form.details[_rowIndex].inventoryRelatedAccountId : data.form.details[_rowIndex].inventoryRelatedAccountName) }}`,
                            value: '{{$getDisable() ? data.form.details[_rowIndex].inventoryRelatedAccountName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryRelatedAccountId : data.form.details[_rowIndex].inventoryRelatedAccountName}}',
                            onChange: '{{function(v){$onFieldChange(null,"data.other.accounts",_rowIndex,data.form.details[_rowIndex],null,null,null,v)}}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                key: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].id}}',
                                value: '{{data.other.accounts && data.other.accounts[_lastIndex].id}}',
                                children: '{{data.other.accounts && data.other.accounts[_lastIndex].codeAndName}}',
                                title: '{{data.other.accounts && data.other.accounts[_lastIndex].codeAndName}}',
                                _power: 'for in data.other.accounts'
                            },
                            dropdownFooter: {
                                name: 'add',
                                component: 'Button',
                                type: 'primary',
                                style: { width: '100%', borderRadius: '0' },
                                onClick: "{{function(){$addSubject(_rowIndex)}}}",
                                children: '新增科目'
                            },
                            _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex'
                        }
                    },
                    {
                        name: 'inventoryCode',
                        component: 'DataGrid.Column',
                        columnKey: 'inventoryCode',
                        flexGrow: 1,
                        width: 66,
                        _visible: '{{$getColumnVisible("inventoryCode")}}',
                        header: {
                            name: 'header',
                            // className: 'ant-form-item-required',
                            component: 'DataGrid.Cell',
                            // children: '存货编码',
                            children: '{{$getColumnCaption("inventoryCode")}}',
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.TextCell',
                            enableTooltip: true,
                            align: 'left',
                            className: '{{$getCellClassName(_ctrlPath)}}',
                            value: '{{data.form.details[_rowIndex] && (data.form.details[_rowIndex].inventoryCode || data.form.details[_rowIndex].businessTypeCode)}}',
                            // children: {
                            //     name: 'option',
                            //     component: 'Select.Option',
                            //     value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                            //     children: '{{data.other.inventory && data.other.inventory[_lastIndex].code}}',
                            //     _power: 'for in data.other.inventory'
                            // },
                            // _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'specification',
                        component: 'DataGrid.Column',
                        columnKey: 'specification',
                        flexGrow: 1,
                        width: 66,
                        _visible: '{{$getColumnVisible("specification")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{$getColumnCaption("specification")}}',
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.TextCell',
                            enableTooltip: true,
                            className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-pu-invoice-card-cell-disabled'}}",
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'unit',
                        component: 'DataGrid.Column',
                        columnKey: 'unit',
                        flexGrow: 1,
                        width: 66,
                        _visible: '{{$getColumnVisible("unit")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{$getColumnCaption("unit")}}',
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.TextCell',
                            enableTooltip: true,
                            className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-pu-invoice-card-cell-disabled'}}",
                            value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'quantity',
                        component: 'DataGrid.Column',
                        columnKey: 'quantity',
                        flexGrow: 1,
                        width: 102,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            // className: 'ant-form-item-required',
                            children: '数量'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            precision: 6,
                            interceptTab: true,
                            align: 'right',
                            timeout: true,
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-pu-invoice-card-cell-right"}}',
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].quantity ? {border: '1px solid red'} : {}}}",
                            value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6, $getDisable() ? false:$isFocus(_ctrlPath),true)}}',
                            onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                            _power: '({rowIndex})=>rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'ttk-scm-app-pu-invoice-card-list-cell-right',
                            align: 'right',
                            tip: true,
                            value: '{{$sumColumn("quantity")}}',
                            // children: '{{$sumColumn("quantity")}}'
                        }
                    }, {
                        name: 'price',
                        component: 'DataGrid.Column',
                        columnKey: 'price',
                        flexGrow: 1,
                        width: 102,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            // className: 'ant-form-item-required',
                            children: '单价'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" :$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            precision: 6,
                            interceptTab: true,
                            timeout: true,
                            align: 'right',
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-pu-invoice-card-cell-right"}}',
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].price ? {border: '1px solid red'} : {}}}",
                            value: '{{$quantityFormat(data.form.details[_rowIndex].price,6,$getDisable() ? false :$isFocus(_ctrlPath))}}',
                            onChange: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'amount',
                        component: 'DataGrid.Column',
                        columnKey: 'amount',
                        flexGrow: 1,
                        width: 102,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '{{data.form.invoiceTypeId == "4000010040" ? "完税价格":"金额"}}'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" :$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            precision: 2,
                            interceptTab: true,
                            align: 'right',
                            timeout: true,
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-pu-invoice-card-cell ttk-scm-app-pu-invoice-card-cell-right"}}',
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].amount ? {border: '1px solid red'} : {}}}",
                            value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2, $getDisable() ? false : $isFocus(_ctrlPath))}}',
                            onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                            _power: '({rowIndex})=>rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'ttk-scm-app-pu-invoice-card-list-cell-right',
                            align: 'right',
                            tip: true,
                            value: '{{$sumColumn("amount")}}',
                            // children: '{{$sumColumn("amount")}}'
                        }
                    }, {
                        name: 'taxRate',
                        component: 'DataGrid.Column',
                        columnKey: 'taxRate',
                        flexGrow: 1,
                        width: 66,
                        _visible: true,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-required',
                            children: '税率'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath)}}',
                            showSearch: false,
                            allowClear: true,
                            enableTooltip: true,
                            align: 'right',
                            dropdownMatchSelectWidth: false,
                            dropdownStyle: { width: '125px' },
                            // value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].taxRateName}}',
                            value: '{{$getDisable() ? data.form.details[_rowIndex].taxRateName:$isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].taxRateId : data.form.details[_rowIndex].taxRateName}}',
                            onChange: '{{$calc("taxRateName", _rowIndex, data.form.details[_rowIndex])}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                value: '{{data.other.taxRate && data.other.taxRate[_lastIndex].name}}',
                                value: '{{data.other.taxRate && data.other.taxRate[_lastIndex].id}}',
                                children: '{{data.other.taxRate && data.other.taxRate[_lastIndex].name}}',
                                _power: 'for in data.other.taxRate'
                            },
                            _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex',
                        }
                    }, {
                        name: 'tax',
                        component: 'DataGrid.Column',
                        columnKey: 'tax',
                        flexGrow: 1,
                        width: 102,
                        _visible: true,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '税额'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            precision: 2,
                            interceptTab: true,
                            align: 'right',
                            timeout: true,
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-pu-invoice-card-cell ttk-scm-app-pu-invoice-card-cell-right"}}',
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].tax ? {border: '1px solid red'} : {}}}",
                            value: '{{$quantityFormat(data.form.details[_rowIndex].tax,2, $getDisable() ? false : $isFocus(_ctrlPath))}}',
                            onChange: '{{$calc("tax", _rowIndex, data.form.details[_rowIndex])}}',
                            _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'ttk-scm-app-pu-invoice-card-list-cell-right',
                            align: 'right',
                            tip: true,
                            value: '{{$sumColumn("tax")}}',
                            // children: '{{$sumColumn("tax")}}'
                        }
                    }, {
                        name: 'taxInclusiveAmount',
                        component: 'DataGrid.Column',
                        columnKey: 'taxInclusiveAmount',
                        flexGrow: 1,
                        width: 102,
                        _visible: true,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{data.form.invoiceTypeId == "4000010030" ? "票面价格" : "价税合计"}}'
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" :$isFocus(_ctrlPath) ? "Input.Number" : "DataGrid.TextCell"}}',
                            enableTooltip: true,
                            precision: 2,
                            interceptTab: true,
                            align: 'right',
                            timeout: true,
                            className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-pu-invoice-card-cell ttk-scm-app-pu-invoice-card-cell-right"}}',
                            style: "{{data.error[_rowIndex] && data.error[_rowIndex].taxInclusiveAmount ? {border: '1px solid red'} : {}}}",
                            value: '{{$quantityFormat(data.form.details[_rowIndex].taxInclusiveAmount,2, $getDisable() ? false:$isFocus(_ctrlPath))}}',
                            onChange: '{{$calc("taxInclusiveAmount", _rowIndex, data.form.details[_rowIndex])}}',
                            _power: '({rowIndex})=>rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'ttk-scm-app-pu-invoice-card-list-cell-right',
                            align: 'right',
                            tip: true,
                            value: '{{$sumColumn("taxInclusiveAmount")}}',
                            // children: '{{$sumColumn("taxInclusiveAmount")}}'
                        }
                    }, {
                        name: 'inventoryType',
                        component: 'DataGrid.Column',
                        columnKey: 'inventoryType',
                        flexGrow: 1,
                        width: 114,
                        _visible: '{{$getColumnVisible("inventoryType")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{$getColumnCaption("inventoryType")}}',
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath)}}',
                            showSearch: false,
                            allowClear: true,
                            enableTooltip: true,
                            align: 'left',
                            value: `{{data.form.details[_rowIndex] && 
                                ($getDisable() ? data.form.details[_rowIndex].inventoryTypeName:
                                $isFocus(_ctrlPath) ? data.form.details[_rowIndex].inventoryType : data.form.details[_rowIndex].inventoryTypeName) }}`,
                            // onChange: '{{$onFieldChange(null,"data.other.inventoryTypes",_rowIndex,data.form.details[_rowIndex],null)}}',
                            onChange: '{{function(v){$onFieldChange(null,"data.other.inventoryTypes",_rowIndex,data.form.details[_rowIndex],null,null,null,v)}}}',
                            children: {
                                name: 'option',
                                component: 'Select.Option',
                                key: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryType}}',
                                value: '{{data.other.inventoryTypes && data.other.inventoryTypes[_lastIndex].id}}',
                                children: '{{data.other.inventoryTypes && data.other.inventoryTypes[_lastIndex].name}}',
                                _power: 'for in data.other.inventoryTypes'
                            },
                            _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }, /*{
                        name: 'taxRateType',
                        component: 'DataGrid.Column',
                        columnKey: 'taxRateType',
                        flexGrow: 1,
                        width: 114,
                        _visible: '{{$getColumnVisible("taxRateType")}}',
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '{{$getColumnCaption("taxRateType")}}',
                        },
                        cell: {
                            name: 'cell',
                            component: '{{$getDisable() ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                            className: '{{$getCellClassName(_ctrlPath)}}',
                            showSearch: false,
                            allowClear: true,
                            enableTooltip: true,
                            align: 'left',
                            value: `{{data.form.details[_rowIndex] && 
                                ($getDisable() ? data.form.details[_rowIndex].taxRateTypeName : 
                                $isFocus(_ctrlPath) ? data.form.details[_rowIndex].taxRateType: data.form.details[_rowIndex].taxRateTypeName)}}`,
                            onChange: '{{$onFieldChange(null,"data.other.taxRateTypes",_rowIndex,data.form.details[_rowIndex],null)}}',
                                // onChange: '{{$onFieldChange({ id: `data.form.details.${_rowIndex}.taxRateType`,' +
                                // 'name: `data.form.details.${_rowIndex}.taxRateTypeName`}, "data.other.taxRateTypes", _rowIndex, data.form.details[_rowIndex])}}',
                            // children: {
                            //     name: 'option',
                            //     component: 'Select.Option',
                            //     value: '{{data.other.taxRateTypes && data.other.taxRateTypes[_lastIndex].id}}',
                            //     children: '{{data.other.taxRateTypes && data.other.taxRateTypes[_lastIndex].name}}',
                            //     _power: 'for in data.other.taxRateTypes'
                            // },
                            // onFocus: '{{function(){$getFocusTaxRateTypes(_rowIndex, data.form.details[_rowIndex])}}}',
                            children: '{{$renderTaxRateTypesSelect(_rowIndex, data.form.details[_rowIndex], null)}}',
                            _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                            _power: '({rowIndex})=>rowIndex'
                        }
                    }*/]
            }, {
                name: 'footerBot',
                component: '::div',
                className: 'ttk-scm-app-pu-invoice-card-form-footerBottom',
                children: [{
                    name: 'formFooter',
                    component: 'Layout',
                    className: 'ttk-scm-app-pu-invoice-card-form-footer',
                    children: [{
                        name: 'ZSFS',
                        component: '::div',
                        className: '{{data.form.settles && data.form.settles.length >1 ? "ZSFS" : "ZSFSs"}}',
                        // _visible: '{{data.other.isSignAndRetreat}}',
                        _visible: '{{data.other.isSignAndRetreat!==false}}',
                        children: [{
                            name: 'Sign',
                            component: 'Form.Item',
                            label: '征收方式',
                            className: 'ttk-scm-app-pu-invoice-card-form-footer-balance-signLeft-taxWay',
                        }, {
                            name: 'signs',
                            component: '::div',
                            className: 'signsDiv',
                            children: [{
                                name: 'authentication',
                                component: '::div',
                                children: [{
                                    name: 'checkbox',
                                    component: 'Radio',
                                    //checked: '{{data.other.signAndRetreatCheck}}',
                                    checked: '{{data.form.signAndRetreat===4000100002}}',
                                    className: 'ttk-scm-app-pu-invoice-card-form-footer-balance-signLeft-check',
                                    disabled: '{{$getDisable()}}',
                                    children: '一般项目',
                                    onChange: '{{function(){$settlementChange(4000100002)}}}'
                                }]
                            }, {
                                name: 'signRetreat',
                                component: '::div',
                                children: [{
                                    name: 'checkbox',
                                    component: 'Radio',
                                    // checked: '{{!data.other.signAndRetreatCheck}}',
                                    checked: '{{data.form.signAndRetreat===4000100001}}',
                                    className: 'ttk-scm-app-pu-invoice-card-form-footer-balance-signLeft-check',
                                    disabled: '{{$getDisable()}}',
                                    children: '即征即退',
                                    onChange: '{{function() {$settlementChange(4000100001)}}}'
                                }]
                            }]
                        }]
                    }, {
                        name: 'settlement',
                        component: 'Form',
                        className: 'ttk-scm-app-pu-invoice-card-form-footer-settlement',
                        children: [{
                            name: 'leftFooter',
                            component: '::div',
                            className: 'ttk-scm-app-pu-invoice-card-form-footer-settlement-leftFooter',
                            children: [{
                                name: 'authentication',
                                component: '::div',
                                className: 'checkBox',
                                _visible: '{{data.other.isShowAuth}}',
                                children: [{
                                    name: 'checkbox',
                                    component: 'Checkbox',
                                    checked: '{{data.form.authenticated}}',
                                    // disabled: '{{$isShowAuthenticated() || $getDisable()}}',
                                    disabled: '{{$getDisable()}}',
                                    children: '{{$rendeRauthentication()}}',
                                    onChange: '{{$authenticationChange}}'
                                }]
                            }, {
                                name: 'authenticationSelect',
                                component: 'Form.Item',
                                className: 'authenticationSelect',
                                _visible: '{{data.other.isShowAuth}}',
                                label: '认证月份',
                                validateStatus: "{{data.error.authenticatedMonth ? 'error' : 'success'}}",
                                children: [{
                                    name: 'date',
                                    component: 'DatePicker.MonthPicker',
                                    className: 'dateSelectClass autoFocus_item',
                                    // placeholder: '请选择日期',
                                    placeholder: '',
                                    // value: '{{$stringToMoment(data.form.authenticatedMonth&&data.form.authenticatedMonth)}}',
                                    value: '{{$renderauthMonth()}}',
                                    // value: '{{$stringToMoment(data.form.authenticatedMonth&&data.form.authenticatedMonth.replace(/-/g, "/"))}}',
                                    disabled: '{{data.other.authMonthabled || $getDisable()}}',
                                    onChange: '{{$autMonthChange}}',
                                    disabledDate: '{{$handleDisAuthMonthDate}}'
                                }]
                            }, {
                                name: 'deductible',
                                component: '::div',
                                _visible: '{{data.other.isShowDedu}}',
                                children: [{
                                    name: 'deduct',
                                    component: 'Radio',
                                    checked: '{{data.form.deductible == undefined ? false : data.form.deductible}}',
                                    disabled: '{{data.other.deductabled || $getDisable()}}',
                                    children: '抵扣',
                                    style: { fontSize: '12px' },
                                    onChange: '{{$deductibleChange}}'
                                }, {
                                    name: 'deduct',
                                    component: 'Radio',
                                    children: '不予抵扣',
                                    style: { fontSize: '12px' },
                                    checked: '{{data.form.deductible == undefined ? false : !data.form.deductible}}',
                                    disabled: '{{data.other.deductabled || $getDisable()}}',
                                    onChange: '{{$deductibleChange}}'
                                }]
                            }]
                        }]
                    }]
                }, {
                    name: 'payDiv',
                    component: '::div',
                    className: 'app-pu-invoice-card-form-footer-settlement-payDiv',
                    children: '{{$renderPayDiv()}}'
                }, {
                    name: 'balance',
                    component: 'Form',
                    className: 'app-pu-invoice-card-form-footer-balance',
                    children: [{
                        name: 'balanceItem',
                        component: '::div',
                        className: 'app-pu-invoice-card-form-footer-balance-signRight',
                        children: [{
                            name: 'balanceAdvanceS',
                            component: '::span',
                            children: '剩余金额：'
                        }, {
                            name: 'balanceAdvance',
                            component: '::span',
                            // style: '{{{return (data.other.isDisableBank ? {color: "rgba(0, 0, 0, 0.25)"} : {})}}}',
                            children: '{{$calcBalance(data)}}'
                        }]
                    }]
                }, {
                    name: 'footer',
                    component: 'Layout',
                    className: 'ttk-scm-app-pu-invoice-card-footer',
                    children: [{
                        name: 'left',
                        component: 'Layout',
                        className: 'ttk-scm-app-pu-invoice-card-footer-left',
                        children: [{
                            name: 'creator',
                            component: 'Layout',
                            children: ['制单人：', '{{data.form.creatorName}}'],
                            style: { marginRight: 30 }
                        }]
                    }, {
                        name: 'right',
                        component: 'Layout',
                        className: 'ttk-scm-app-pu-invoice-card-footer-right',
                        children: [{
                            name: 'saveAndNew',
                            component: 'Button',
                            className: 'ttk-scm-app-pu-invoice-card-footer-right-but',
                            onClick: '{{function(){$save(true)}}}',
                            // _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            _visible: '{{!data.other.auditVisible}}',
                            children: '保存并新增'
                        }, {
                            name: 'save',
                            component: 'Button',
                            onClick: '{{function(){$save(false)}}}',
                            _visible: '{{!data.other.auditVisible}}',
                            // _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
                            children: '保存'
                        }, {
                            name: 'cancel',
                            component: 'Button',
                            onClick: '{{$add}}',
                            _visible: '{{!data.other.auditVisible}}',
                            // _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
                            children: '放弃'
                        }]
                    }]
                }]
            }]
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            ok: true,
            form: {
                details: [
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    // blankDetail
                ],
                settles: [{
                    bankAccountId: '',
                    amount: '',
                    bankAccountName: ''
                }],
            },
            total: {

            },
            other: {
                authenticatedMonth: moment().format('YYYY-MM'),
                pageStatus: common.commonConst.PAGE_STATUS.ADD,
                isSignAndRetreat: false, //是否显示征收方式
                signAndRetreat: [{
                    id: 4000100001,
                    name: "即征即退",
                }, {
                    id: 4000100002,
                    name: "一般项目",
                }],
                defaultLength: 5, 	//默认初始行数
                detailHeight: '245px',
                isDisableBank: false,
                auditVisible: false, //控制按钮的显示隐藏
                authMonthabled: true, //认证月份是否可修改
                // authenticatedDisplay: false,
                // deductibleDisplay: false,
                deductabled: true, //抵扣是否ke修改
                signAndRetreatCheck: true, //选择的哪个征收方式
                isShowAuth: false, //是否显示认证 认证月份
                isShowDedu: false, //是否显示抵扣
                isChangeTaxRate: false, //是否改变了税率
                isChageDetails: false, // 保存后是否又修改了明细
                customAttribute: null,
                pageKey: 1
            },
            consts: {
                VOUCHERSTATUS_Approved: consts.consts.VOUCHERSTATUS_Approved, //已审核
                SETTLESTATUS_settled: consts.consts.SETTLESTATUS_settled, //已结清
                pageStatus: common.commonConst.PAGE_STATUS,
            },
            error: {}
        }
    }
}

export const blankDetail = {
    inventoryId: null,
    specification: null,
    unitId: null,
    quantity: null,
    price: null,
    taxRateId: null,
    taxRate: null,
    tax: null,
    amount: null,
    taxInclusiveAmount: null,
    propertyId: null,
    propertyName: null,
    businessTypeId: null,
    businessTypeName: null,
    propertyDetailName: null,
    inventoryType: null,
    inventoryTypeName: null,
    taxRateType: null,
    taxRateTypeName: null,
}

// export const MOVEROW_UP = 0				 //向上移动行
// export const MOVEROW_DOWN = 1			 //向下移动行
