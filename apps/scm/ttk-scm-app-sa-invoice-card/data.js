import { consts, common } from 'edf-constant'
import moment from 'moment'
import { fromJS } from 'immutable'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-scm-app-sa-invoice-card',
        id: 'ttk-scm-app-sa-invoice-card',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-scm-app-sa-invoice-card-header',
            children: [{
                name: 'left',
                component: 'Layout',
                className: 'ttk-scm-app-sa-invoice-card-header-left',
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
                className: 'ttk-scm-app-sa-invoice-card-header-right',
                children: [{
                    name: 'shortcut',
                    component: 'Popover',
                    placement: "bottom",
                    overlayClassName: 'ttk-scm-app-sa-invoice-card-header-left-jianpan',
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
                        className: 'ttk-scm-app-sa-invoice-card-header-left-iconbutton',
                        fontFamily: 'edficon',
                        type: 'jianpan',
                        title: '快捷键',
                    }
                }, {
                    name: 'adds',
                    component: 'Button',
                    className: 'app-sa-arrival-card-header-right-but',
                    onClick: '{{function(){$initLoad(null)}}}',
                    _visible: '{{data.other.auditVisible || !!data.form.discarded}}',
                    children: '新增'
                }, {
                    name: 'add',
                    component: 'Button',
                    className: 'app-sa-arrival-card-header-right-but',
                    onClick: '{{function(){$save(true)}}}',
                    _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                    children: '保存并新增'
                }, {
                    name: 'save',
                    component: 'Button',
                    onClick: '{{function(){$save(false)}}}',
                    _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                    // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
                    children: '保存'
                }, {
                    name: 'audit',
                    component: 'Button',
                    disabled: '{{$getDiscarded()}}',
                    _visible: '{{$notMinfei()&&data.other.auditVisible}}',
                    onClick: '{{$audit}}',
                    children: '{{$getAuditBtnText()}}'
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
                            // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY || data.other.pageStatus === data.consts.pageStatus.ADD}}',
                            disabled: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved || !data.other.auditVisible}}',
                            children: '删除'
                        }, {
                            name: 'deductions',
                            component: 'Menu.Item',
                            key: 'deductions',
                            disabled: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                            children: '扣除额'
                        }, {
                            name: 'receive',
                            component: 'Menu.Item',
                            key: 'receive',
                            disabled: '{{!data.other.auditVisible}}',
                            _visible: `{{$isTvoucher()}}`,
                            children: '收款'
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
            className: 'app-sa-arrival-card-content',
            children: [{
                name: 'title',
                component: 'Layout',
                className: 'ttk-scm-app-sa-invoice-card-title',
                children: [{
                    name: 'left',
                    component: 'Layout',
                    className: 'ttk-scm-app-sa-invoice-card-title-left',
                    children: [{
                        component: 'Layout',
                        className: 'ttk-scm-app-sa-invoice-card-title-left-span',
                        _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                        children: ['凭证字号:', {
                            name: 'code',
                            component: '::span',
                            className: 'code',
                            style: { marginLeft: 10 },
                            children: '{{$doCode()}}',
                            onClick: '{{function() {$openDocContent()}}}',
                            // children: '记' + "{{data.form.docCode || ''}}",
                            _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                        }]
                    }]
                }, {
                    name: 'center',
                    component: '::div',
                    className: 'ttk-scm-app-sa-invoice-card-title-center',
                    children: {
                        name: 'title',
                        component: '::h1',
                        style: { fontWeight: 'bold' },
                        children: '销项发票'
                    }
                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'ttk-scm-app-sa-invoice-card-title-right',
                    children: [{
                        name: 'zi',
                        component: '::span',
                        children: '单据编号:',
                        // _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved}}',
                        // _visible: `{{!(data.other.pageStatus === data.consts.pageStatus.ADD
                        //     || data.form.receiveAmount == data.form.taxInclusiveAmount)
                        // }}`,
                        _visible: '{{data.other.auditVisible}}',
                    }, {
                        name: 'code',
                        component: '::div',
                        className: 'code',
                        style: { marginRight: 10 },
                        // _visible: `{{!(data.other.pageStatus === data.consts.pageStatus.ADD
                        //     || data.form.receiveAmount == data.form.taxInclusiveAmount)
                        // }}`,
                        _visible: '{{data.other.auditVisible}}',
                        children: "{{data.form.code || ''}}"
                    }, {
                        name: 'attachmentItem',
                        component: 'Attachment',
                        status: '{{data.form.attachmentStatus}}',
                        data: '{{data.form.attachmentFiles}}',
                        onDownload: '{{$download}}',
                        loading: '{{data.form.attachmentLoading}}',
                        visible: '{{data.form.attachmentVisible}}',
                        // disabled: '{{!!(data.form.status == data.consts.VOUCHERSTATUS_Approved)}}',
                        onDel: '{{$delFile}}',
                        uploadProps: {
                            disabled: '{{!!(data.form.status == data.consts.VOUCHERSTATUS_Approved)}}',
                            action: '/v1/edf/file/upload', //上传地址,
                            headers: '{{$getAccessToken()}}',
                            accept: '', //接受的上传类型
                            data: { "fileClassification": "ATTACHMENT" },
                            onChange: '{{$attachmentChange}}',
                            beforeUpload: '{{$beforeUpload}}',
                        }
                    }]
                }, {
                    name: 'audited',
                    component: '::img',
                    className: 'ttk-scm-app-sa-invoice-card-img',
                    src: './vendor/img/scm/audited.png',
                    _visible: '{{data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}'
                }, {
                    name: 'discarded',
                    component: '::img',
                    className: 'ttk-scm-app-sa-invoice-card-img1',
                    src: './vendor/img/scm/discarded.png',
                    _visible: '{{!!data.form.discarded}}'
                }]
            }, {
                name: 'formHeader',
                component: 'Form',
                className: 'ttk-scm-app-sa-invoice-card-form-header',
                //notRender: "{{data.other.isRender}}",
                //children:'{{$renderFormContent()}}'
                children: [{
                    name: 'c1',
                    component: 'Form.Item',
                    label: '单据日期',
                    className: 'businessDate_container',
                    validateStatus: "{{!data.form.businessDateError ? 'success' : 'error'}}",
                    required: true,
                    children: {
                        name: 'd1',
                        component: 'DatePicker',
                        className: 'autoFocus_item',
                        value: "{{$stringToMoment(data.form.businessDate)}}",
                        autoFocus: true,
                        disabled: '{{data.other.voucherStatus}}',
                        disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
                        getCalendarContainer: "{{function(){return document.getElementsByClassName('businessDate_container')[0]}}}",
                        onChange: `{{function(v){$handleChange('data.form.businessDate',$momentToString(v, "YYYY-MM-DD"))}}}`,

                    }
                }, {
                    name: 'c2',
                    component: 'Form.Item',
                    label: '发票类型',
                    required: true,
                    children: [{
                        name: 'invoiceType',
                        component: 'Select',
                        className: 'autoFocus_item',
                        autoFocus: true,
                        showSearch: false,
                        disabled: '{{data.other.voucherStatus}}',
                        value: '{{data.form.invoiceTypeId}}',
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.invoiceTypeId", name: "data.form.invoiceTypeName" },"data.other.invoiceType",null,null,null,v)}}}',
                        //onChange: `{{$onFieldChange({ id: 'data.form.invoiceTypeId', name: 'data.form.invoiceTypeName' },'data.other.invoiceType')}}`,
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
                        content: '增值税专用发票，货物运输增值税专用发票，机动车销售发票类型归类到增值税专用发票中',
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
                    label: '购方名称',
                    validateStatus: "{{!data.form.customerNameError ? 'success' : 'error'}}",
                    required: true,
                    children: [{
                        name: 'customer',
                        component: 'Select',
                        className: 'autoFocus_item',
                        placeholder: '按名称/拼音/编码搜索',
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '225px' },
                        autoFocus: true,
                        disabled: '{{data.other.voucherStatus}}',
                        onFocus: '{{function(){$getCustomer()}}}',
                        filterOption: '{{function(v,option){return $filterOptionArchives("customer",v,option)}}}',
                        //dropdownFooter: "{{$handleAddRecord('Customer', 'customer')}}",
                        value: '{{data.other.voucherStatus ? data.form.customerName : (data.form.customerId ? data.form.customerId : data.form.customerName)}}',
                        //onChange: `{{function(v){$assetPropertyChange('data.form.assetProperty',data.other.assetProperty.filter(function(o){return o.value == v})[0])}}}`,
                        onChange: `{{function(v){$onFieldChange({ id: "data.form.customerId", name: "data.form.customerName" },"data.other.customer",null,null,null,v)}}}`,
                        //onChange: `{{$onFieldChange({ id: 'data.form.customerId', name: 'data.form.customerName' },'data.other.customer')}}`,
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            key: '{{data.other.customer && data.other.customer[_rowIndex].id }}',
                            value: '{{data.other.customer && data.other.customer[_rowIndex].id }}',
                            children: '{{data.other.customer && data.other.customer[_rowIndex].code +" "+ data.other.customer[_rowIndex].name}}',
                            _power: 'for in data.other.customer'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('customer')}}}"
                        },
                    }]
                }, {
                    name: 'c4',
                    component: 'Form.Item',
                    label: '发票代码',
                    validateStatus: "{{!data.form.invoiceCodeError ? 'success' : 'error'}}",
                    children: [{
                        name: 'invoiceCode',
                        component: 'Input',
                        className: 'autoFocus_item',
                        timeout: true,
                        value: "{{data.form.invoiceCode}}",
                        maxLength: 12,
                        disabled: '{{data.other.voucherStatus}}',
                        onChange: `{{function(e){$handleChange("data.form.invoiceCode", e.target.value)}}}`,

                    }]
                }, {
                    name: 'c5',
                    component: 'Form.Item',
                    label: '发票号码',
                    validateStatus: "{{!data.form.invoiceNumberError ? 'success' : 'error'}}",
                    children: [{
                        name: 'invoiceCode',
                        component: 'Input',
                        className: 'autoFocus_item',
                        value: "{{data.form.invoiceNumber}}",
                        maxLength: 8,
                        timeout: true,
                        disabled: '{{data.other.voucherStatus}}',
                        onChange: `{{function(e){$handleChange("data.form.invoiceNumber", e.target.value)}}}`,

                    }]
                }, {
                    name: 'c6',
                    component: 'Form.Item',
                    label: '开票日期',
                    className: 'invoiceDate_container',
                    validateStatus: "{{!data.form.dateError ? 'success' : 'error'}}",
                    required: true,
                    children: {
                        name: 'invoiceDate',
                        component: 'DatePicker',
                        className: 'autoFocus_item',
                        value: "{{$stringToMoment(data.form.invoiceDate)}}",
                        disabled: '{{data.other.voucherStatus}}',
                        disabledDate: '{{function(value){return $handleDisabledDates(value)}}}',
                        getCalendarContainer: "{{function(){return document.getElementsByClassName('invoiceDate_container')[0]}}}",
                        onChange: `{{function(v){$handleChange('data.form.invoiceDate',$momentToString(v, "YYYY-MM-DD"))}}}`,

                    }
                }, {
                    name: 'c7',
                    component: 'Form.Item',
                    label: '部门',
                    _visible: '{{$getVisible("department")}}',
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
                        allowClear: true,
                        filterOption: '{{function(v,option){return $filterOptionArchives("department",v,option)}}}',
                        disabled: '{{data.other.voucherStatus}}',
                        onFocus: '{{function(){$getDepartment()}}}',
                        //dropdownFooter: "{{$handleAddRecord('Department', 'department')}}",
                        //value: '{{data.form.department && data.form.department.id}}',
                        value: '{{data.form.departmentId}}',
                        //onChange: `{{$onFieldChange({ id: 'data.form.departmentId', name: 'data.form.departmentName' },'data.other.department')}}`,
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.departmentId", name: "data.form.departmentName" },"data.other.department",null,null,null,v)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.department && data.other.department[_rowIndex].id }}',
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
                    _visible: '{{$getVisible("project")}}',
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
                        allowClear: true,
                        filterOption: '{{function(v,option){return $filterOptionArchives("project",v,option)}}}',
                        disabled: '{{data.other.voucherStatus}}',
                        onFocus: '{{function(){$getProject()}}}',
                        //dropdownFooter: "{{$handleAddRecord('Project', 'project')}}",
                        value: '{{data.form.projectId}}',
                        onChange: '{{function(v){$onFieldChange({ id: "data.form.projectId", name: "data.form.projectName" },"data.other.project",null,null,null,v)}}}',
                        //onChange: `{{$onFieldChange({ id: 'data.form.projectId', name: 'data.form.projectName' },'data.other.project')}}`,
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            key: '{{data.other.project && data.other.project[_rowIndex].id }}',
                            value: '{{data.other.project && data.other.project[_rowIndex].id }}',
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
                    _visible: '{{$getVisible("remark")}}',
                    className: 'app-sa-delivery-card-form-header-remark',
                    children: {
                        name: 'remark',
                        className: 'autoFocus_item',
                        component: 'Input',
                        timeout: true,
                        value: "{{data.form.remark}}",
                        title: "{{data.form.remark}}",
                        disabled: '{{data.other.voucherStatus}}',
                        onChange: `{{function(e){$handleChanges("data.form.remark", e.target.value)}}}`,
                    }
                }]
            }, {
                name: 'details',
                component: 'DataGrid',
                className: 'ttk-scm-app-sa-invoice-card-form-details',
                headerHeight: 35,
                rowHeight: 35,
                footerHeight: 35,
                rowsCount: '{{data.form.details.length}}',
                enableSequence: true,
                startSequence: 1,
                // enableSequenceAddDelrow: true,
                enableSequenceAddDelrow: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY ? false : true}}',
                sequenceFooter: {
                    name: 'footer',
                    component: 'DataGrid.Cell',
                    children: '合计'
                },
                // key: '{{data.other.detailHeight}}',
                key: '{{$renderKey()}}',
                readonly: false,
                style: '{{{return{height: data.other.detailHeight}}}}',
                onAddrow: "{{$addRow('details')}}",
                onDelrow: "{{$delRow('details')}}",
                onKeyDown: '{{$gridKeydown}}',
                scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                scrollToRow: '{{data.other.detailsScrollToRow}}',
                columns: [{
                    name: 'inventoryName',
                    component: 'DataGrid.Column',
                    columnKey: 'inventoryName',
                    flexGrow: 1,
                    width: 138,
                    header: {
                        name: 'header',
                        className: 'ant-form-item-center',
                        className: "{{data.form.voucherSource =='4000090002' ? '' : 'ant-form-item-required'}}",
                        component: 'DataGrid.Cell',
                        children: '存货名称'
                    },
                    cell: {
                        name: 'cell',
                        component: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-center ' + $redCellBorder('inventoryStyle',_rowIndex)}}",
                        showSearch: true,
                        allowClear: true,
                        isNeedAdd:true,
                        // lazyload:true,
                        dropdownMatchSelectWidth: false,
                        // dropdownClassName: 'ttk-scm-app-sa-invoice-card-dropdownname',
                        // dropdownClassNameCopy: 'ttk-scm-app-sa-invoice-card-dropdownnamecopy',
                        lazyload:'{{data.other.inventory.length> 200 ? true : false}}',
                        dropdownClassName: "{{data.other.inventory.length > 200 ? 'ttk-scm-app-sa-invoice-card-dropdownname' : 'ttk-scm-app-sa-invoice-card-dropdownnamecopy'}}",
                        dropdownClassNameCopy: 'ttk-scm-app-sa-invoice-card-dropdownnamecopy',
                        dropdownStyle: { width: '300px' },
                        // value: `{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ?
                        //     data.form.details[_rowIndex].inventoryName : 
                        //     $isFocus(_ctrlPath) ?
                        //     data.form.details[_rowIndex] && $renderInventoryName(data.form.details[_rowIndex].inventoryId,"data.other.inventory",data.form.details[_rowIndex].inventoryName) : 
                        //     data.form.details[_rowIndex].inventoryName}}`,
                        title: `{{ data.form.details[_rowIndex] && $renderInventoryTitle(data.form.details[_rowIndex].inventoryId,"data.other.inventory",data.form.details[_rowIndex].inventoryName)}}`,
                        value: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? data.form.details[_rowIndex].inventoryName : $isFocus(_ctrlPath) ? (data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId ? data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName) : data.form.details[_rowIndex].inventoryName}}',
                        // title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryName}}',
                        onChange: '{{function(value){$onFieldChange(null,"data.other.inventory",_rowIndex,data.form.details[_rowIndex],null,value)}}}',
                        //onChange: '{{$onFieldChange(null,"data.other.inventory",_rowIndex,data.form.details[_rowIndex],null)}}',
                        filterOption: '{{$filterOption}}',
                        // onFocus: '{{function(){$getInventory({entity:{isEnable:true}}, `data.other.inventory`)}}}',
                        //dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                        // children: {
                        //     name: 'option',
                        //     component: 'Select.Option',
                        //     value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                        //     title: '{{data.other.inventory && data.other.inventory[_lastIndex].fullName}}',
                        //     children: '{{ $getFullNameChildren(data.other.inventory && data.other.inventory[_lastIndex]) }}',
                        //     _power: 'for in data.other.inventory'
                        // },
                        children: '{{$renderSelectOption()}}',
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('inventory',_rowIndex,data.form.details[_rowIndex])}}}"
                        },
                        addFooterClick:'{{function(){$addArchive("inventory", _rowIndex, data.form.details[_rowIndex])}}}',
                        _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                        _power: '({rowIndex})=>rowIndex',
                    }
                }, {
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
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-disabled ttk-scm-app-sa-invoice-card-cell-center'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceInvName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].invoiceInvName}}',
                        _power: '({rowIndex})=>rowIndex',
                    }
                }, {
                    name: 'inventoryCode',
                    component: 'DataGrid.Column',
                    columnKey: 'inventoryCode',
                    flexGrow: 1,
                    width: 66,
                    _visible: '{{$getColumnVisible("inventoryCode")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: 'ant-form-item-center',
                        children: '{{$getColumnCaption("inventoryCode")}}',
                    },
                    cell: {
                        name: 'cell',
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-disabled ttk-scm-app-sa-invoice-card-cell-center'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryCode}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryCode}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                            children: '{{data.other.inventory && data.other.inventory[_lastIndex].code}}',
                            _power: 'for in data.other.inventory'
                        },
                        _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                        _power: '({rowIndex})=>rowIndex',
                    }
                },
                {
                    name: 'revenueType',
                    component: 'DataGrid.Column',
                    columnKey: 'revenueType',
                    flexGrow: 1,
                    width: 102,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: 'ant-form-item-required ant-form-item-center',
                        children: '收入类型'
                    },
                    cell: {
                        name: 'cell',
                        component: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-center ' + $redCellBorder('revenueTypeStyle',_rowIndex)}}",
                        showSearch: true,
                        allowClear: true,
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '225px' },
                        filterOption: '{{$filterOption}}',
                        //dropdownFooter: "{{$handleAddRecord('RevenueType', 'revenueType', _rowIndex, data.form.details[_rowIndex])}}",
                        value: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? data.form.details[_rowIndex].revenueTypeName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].revenueType : data.form.details[_rowIndex].revenueTypeName}}',
                        title: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? data.form.details[_rowIndex].revenueTypeName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].revenueType : data.form.details[_rowIndex].revenueTypeName}}',
                        onChange: '{{function(value){$onFieldChange(null,"data.other.revenueType",_rowIndex,data.form.details[_rowIndex],null,value)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.revenueType && data.other.revenueType[_lastIndex].id}}',
                            title: '{{data.other.revenueType && data.other.revenueType[_lastIndex].name}}',
                            children: '{{data.other.revenueType && data.other.revenueType[_lastIndex].name}}',
                            _power: 'for in data.other.revenueType'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{function(){$addArchive('revenueType',_rowIndex)}}}"
                        },
                        _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                        _power: '({rowIndex})=>rowIndex',
                    }
                },
                {
                    name: 'specification',
                    component: 'DataGrid.Column',
                    columnKey: 'specification',
                    flexGrow: 1,
                    width: 66,
                    _visible: '{{$getColumnVisible("specification")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: 'ant-form-item-center',
                        children: '{{$getColumnCaption("specification")}}',
                    },
                    cell: {
                        name: 'cell',
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-sa-invoice-card-cell-disabled ttk-scm-app-sa-invoice-card-cell-center'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
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
                        className: 'ant-form-item-center',
                        children: '{{$getColumnCaption("unit")}}',
                    },
                    cell: {
                        name: 'cell',
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + 'ttk-scm-app-sa-invoice-card-cell-disabled ttk-scm-app-sa-invoice-card-cell-Newcenter'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
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
                        className: 'ant-form-item-center',
                        children: '数量'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        interceptTab: true,
                        style: "{{data.error[_rowIndex] && data.error[_rowIndex].quantity ? {border: '1px solid red'} : {}}}",
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath),true)}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,$isFocus(_ctrlPath),true)}}',
                        timeout: true,
                        onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                        _power: '({rowIndex})=>rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-sa-invoice-card-list-cell-right',
                        children: '{{$sumColumn("quantity")}}'
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
                        className: 'ant-form-item-center',
                        children: '单价'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        interceptTab: true,
                        style: "{{data.error[_rowIndex] && data.error[_rowIndex].price ? {border: '1px solid red'} : {}}}",
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].price,6,$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].price,6,$isFocus(_ctrlPath))}}',
                        timeout: true,
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
                        className: 'ant-form-item-required ant-form-item-center',
                        children: '金额'
                    },
                    cell: {
                        name: 'cell',
                        precision: 2,
                        interceptTab: true,
                        timeout: true,
                        style: "{{data.error[_rowIndex] && data.error[_rowIndex].amount ? {border: '1px solid red'} : {}}}",
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                        _power: '({rowIndex})=>rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-sa-invoice-card-list-cell-right',
                        children: '{{$sumColumn("amount")}}'
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
                        className: 'ant-form-item-center ant-form-item-required',
                        children: '税率'
                    },
                    cell: {
                        name: 'cell',
                        precision: 2,
                        interceptTab: true,
                        dropdownMatchSelectWidth: false,
                        dropdownStyle: { width: '125px' },
                        // disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell-right"}}',
                        showSearch: false,
                        allowClear: true,
                        enableTooltip: true,
                        value: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? data.form.details[_rowIndex].taxRateName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].taxRateId : data.form.details[_rowIndex].taxRateName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].taxRateName}}',
                        onChange: '{{$calc("taxRateName", _rowIndex, data.form.details[_rowIndex])}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
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
                        className: 'ant-form-item-center',
                        children: '税额'
                    },
                    cell: {
                        name: 'cell',
                        precision: 2,
                        interceptTab: true,
                        timeout: true,
                        style: "{{data.error[_rowIndex] && data.error[_rowIndex].tax ? {border: '1px solid red'} : {}}}",
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell ttk-scm-app-sa-invoice-card-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].tax,2,$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].tax,2,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("tax", _rowIndex, data.form.details[_rowIndex])}}',
                        _power: '({rowIndex})=>rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-sa-invoice-card-list-cell-right',
                        children: '{{$sumColumn("tax")}}'
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
                        className: 'ant-form-item-center',
                        children: '价税合计'
                    },
                    cell: {
                        name: 'cell',
                        precision: 2,
                        interceptTab: true,
                        timeout: true,
                        style: "{{data.error[_rowIndex] && data.error[_rowIndex].taxInclusiveAmount ? {border: '1px solid red'} : {}}}",
                        disabled: '{{data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded}}',
                        component: '{{(data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell ttk-scm-app-sa-invoice-card-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].taxInclusiveAmount,2,$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].taxInclusiveAmount,2,$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("taxInclusiveAmount", _rowIndex, data.form.details[_rowIndex])}}',
                        _power: '({rowIndex})=>rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-sa-invoice-card-list-cell-right',
                        children: '{{$sumColumn("taxInclusiveAmount")}}'
                    }
                }, {
                    name: 'inventoryType',
                    component: 'DataGrid.Column',
                    columnKey: 'inventoryType',
                    _visible: '{{$getColumnVisible("inventoryType")}}',
                    flexGrow: 1,
                    width: 114,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '{{$getColumnCaption("inventoryType")}}',
                        className: 'ant-form-item-center',
                    },
                    cell: {
                        name: 'cell',
                        component: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-sa-invoice-card-cell-center"}}',
                        showSearch: false,
                        allowClear: true,
                        // dropdownMatchSelectWidth: false,
                        // dropdownStyle: { width: '225px' },
                        value: '{{(data.form.discarded || data.form.status == data.consts.VOUCHERSTATUS_Approved && !data.form.discarded) ? data.form.details[_rowIndex].inventoryTypeName : $isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryType : data.form.details[_rowIndex].inventoryTypeName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryTypeName}}',
                        //onChange: '{{$onFieldChange(null,"data.other.inventoryTypes",_rowIndex,data.form.details[_rowIndex],null)}}',
                        onChange: '{{function(value){$onFieldChange(null,"data.other.inventoryTypes",_rowIndex,data.form.details[_rowIndex],null,value)}}}',
                        children: {
                            name: 'option',
                            component: 'Select.Option',
                            value: '{{data.other.inventoryTypes && data.other.inventoryTypes[_lastIndex].id}}',
                            children: '{{data.other.inventoryTypes && data.other.inventoryTypes[_lastIndex].name}}',
                            _power: 'for in data.other.inventoryTypes'
                        },
                        _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                        _power: '({rowIndex})=>rowIndex'
                    }
                }, {
                    name: 'taxRateType',
                    component: 'DataGrid.Column',
                    columnKey: 'taxRateType',
                    _visible: '{{$getColumnVisible("taxRateType")}}',
                    flexGrow: 1,
                    width: 114,
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: 'ant-form-item-center',
                        children: '{{$getColumnCaption("taxRateType")}}',
                    },
                    cell: {
                        name: 'cell',
                        component: '{{data.other.voucherStatus ? "DataGrid.TextCell" : $isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
                        className: '{{$getCellClassName(_ctrlPath)}}',
                        showSearch: false,
                        allowClear: true,
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].taxRateTypeName}}',
                        onChange: '{{function(value){$onFieldChange(null,"data.other.taxRateTypes",_rowIndex,data.form.details[_rowIndex],null,value)}}}',
                        //onChange: '{{$onFieldChange(null,"data.other.taxRateTypes",_rowIndex,data.form.details[_rowIndex],null)}}',
                        value: `{{data.form.details[_rowIndex] && 
                            (data.other.voucherStatus ? data.form.details[_rowIndex].taxRateTypeName : 
                            $isFocus(_ctrlPath) ? data.form.details[_rowIndex].taxRateType: data.form.details[_rowIndex].taxRateTypeName)}}`,
                        // onChange: '{{$onFieldChange({ id: `data.form.details.${_rowIndex}.taxRateType`,' +
                        //     'name: `data.form.details.${_rowIndex}.taxRateTypeName`}, "data.other.taxRateTypes", _rowIndex, data.form.details[_rowIndex])}}',
                        children: '{{$renderTaxRateTypesSelect(_rowIndex, data.form.details[_rowIndex], null)}}',
                        _excludeProps: '{{$isFocus(_ctrlPath)? ["onClick"] : ["children"]}}',
                        _power: '({rowIndex})=>rowIndex'
                    }
                }]
            }, {
                name: 'formFooter',
                component: 'Layout',
                className: 'ttk-scm-app-sa-invoice-card-form-footer',
                children: [{
                    name: 'formFooterTop',
                    component: '::div',
                    className: 'app-sa-invoice-card-form-footer-top',
                    children: [{
                        name: 'billing',
                        component: 'Form',
                        className: 'ttk-scm-app-sa-invoice-card-form-footer-billing',
                        children: [{
                            name: 'Sign',
                            component: 'Form.Item',
                            label: '开票类型',
                            className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-billing-taxWay',
                        }, {
                            name: 'checkbox2',
                            component: '::div',
                            children: [{
                                name: 'checkbox',
                                component: 'Radio',
                                checked: '{{!data.form.issuedByTax}}',
                                disabled: '{{ data.form.status == data.consts.VOUCHERSTATUS_Approved || data.form.discarded}}',
                                className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-billing-check',
                                // disabled: '{{$isShowAuthenticated() || $getVoucherStatus()}}',
                                children: '自开',
                                onChange: '{{$issuedByTaxonChange}}'
                            }]
                        }, {
                            name: 'checkbox1',
                            component: '::div',
                            children: [{
                                name: 'checkbox',
                                component: 'Radio',
                                checked: '{{data.form.issuedByTax}}',
                                disabled: '{{ data.form.status == data.consts.VOUCHERSTATUS_Approved || data.form.discarded}}',
                                className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-billing-check',
                                children: '代开',
                                onChange: '{{$issuedByTaxonChange}}'
                            }]
                        }]
                    }, {
                        name: 'settlement',
                        component: 'Form',
                        className: 'ttk-scm-app-sa-invoice-card-form-footer-settlement',
                        _visible: '{{data.other.isSignAndRetreat!==false}}',
                        children: [{
                            name: 'Sign',
                            component: 'Form.Item',
                            label: '征收方式',
                            className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-signLeft-taxWay',
                            //_visible: '{{data.other.isSignAndRetreat}}',
                        }, {
                            name: 'authentication',
                            component: '::div',
                            //_visible: '{{data.other.isSignAndRetreat}}',
                            children: [{
                                name: 'checkbox',
                                component: 'Radio',
                                //checked: '{{data.form.signAndRetreat}}',
                                checked: '{{data.form.signAndRetreat===4000100002}}',
                                disabled: '{{ data.form.status == data.consts.VOUCHERSTATUS_Approved || data.form.discarded}}',
                                className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-signLeft-check',
                                children: '一般项目',
                                onChange: '{{function(){$authenticationChange(4000100002)}}}'
                            }]
                        }, {
                            name: 'signRetreat',
                            component: '::div',
                            //_visible: '{{data.other.isSignAndRetreat}}',
                            children: [{
                                name: 'checkbox',
                                component: 'Radio',
                                //checked: '{{!data.form.signAndRetreat}}',
                                checked: '{{data.form.signAndRetreat===4000100001}}',
                                disabled: '{{ data.form.status == data.consts.VOUCHERSTATUS_Approved || data.form.discarded}}',
                                className: 'ttk-scm-app-sa-invoice-card-form-footer-balance-signLeft-check',
                                // disabled: '{{$isShowAuthenticated() || $getVoucherStatus()}}',
                                children: '即征即退',
                                onChange: '{{function(){$authenticationChange(4000100001)}}}'
                            }]
                        }]
                    }]
                }, {
                    name: 'formFooters',
                    component: '::div',
                    className: 'app-sa-invoice-card-form-footers',
                    children: [{
                        name: 'settlement',
                        component: 'Form',
                        className: 'app-sa-invoice-card-form-footers-settlement',
                        children: [{
                            name: 'payDiv',
                            component: '::div',
                            //_notRender: true,
                            className: 'app-pu-invoice-card-formfooters-settlement-payDiv',
                            /*children: [{
                                name: 'settlement-range',
                                component: 'Form',
                                className: 'app-pu-arrival-card-form-footer-settlement',
                                children: {
                                    name: 'r1',
                                    component: 'Repeter',
                                    children: [{
                                        name: 'f1',
                                        component: 'Form.Item',
                                        label: '结算方式',
                                        validateStatus: "{{!data.form.bankAccountNameError ? 'success' : 'error'}}",
                                        children: [{
                                            name: 'bankAccount',
                                            component: 'Select',
                                            className: 'autoFocus_item',
                                            showSearch: false,
                                            placeholder: '请选择账户',
                                            allowClear: true,
                                            disabled: '{{$getVoucherStatus()}}',
                                            onFocus: '{{function(){$getBankAccount()}}}',
                                            value: '{{data.form.bankAccountId}}',
                                            onChange: `{{function(v){$onFieldChange({ id: "data.form.bankAccountId", name: "data.form.bankAccountName" },"data.other.bankAccount",null,null,0,v)}}}`,
                                            children: {
                                                name: 'option',
                                                component: 'Select.Option',
                                                key: '{{data.other.bankAccount && data.other.bankAccount[_rowIndex].id }}',
                                                value: '{{data.other.bankAccount && data.other.bankAccount[_rowIndex].id }}',
                                                children: '{{data.other.bankAccount && data.other.bankAccount[_rowIndex].name}}',
                                                _power: 'for in data.other.bankAccount'
                                            }
                                        }]
                                    }, {
                                        name: 'f2',
                                        component: 'Form.Item',
                                        label: '结算金额',
                                        validateStatus: "{{!data.form.amountError ? 'success' : 'error'}}",
                                        children: [{
                                            name: 'amount',
                                            component: 'Input',
                                            className: 'autoFocus_item',
                                            value: "",
                                            precision: 2,
                                            disabled: '{{$getVoucherStatus()}}',
                                            onBlur: '',
                                            onChange: `{{function(e){$handleChange("data.form.invoiceCode", e.target.value)}}}`,

                                        }]
                                    }, {
                                        name: 'f3',
                                        className: 'app-pu-arrival-card-form-footer-paymentAmount-iconDiv',
                                        component: '::div',
                                        children: [{
                                            name: 'f31',
                                            component: 'Icon',
                                            className: 'app-pu-arrival-card-form-footer-paymentAmount-iconDiv-iconAdd',
                                            type: 'plus',
                                            title: '新增',
                                            disabled: '{{$getVoucherStatus()}}',
                                            onClick: '{{$addPaymentAmount}}'
                                        }, {
                                            name: 'f32',
                                            component: 'Icon',
                                            className: 'app-pu-arrival-card-form-footer-paymentAmount-iconDiv-iconDel   ',
                                            type: 'minus',
                                            title: '删除',
                                            disabled: '{{$getVoucherStatus()}}',
                                            onClick: '{{$delPaymentAmount}}'
                                        }]

                                    }]
                                }
                            }]*/
                            children: '{{$renderPayDiv()}}'
                        }]
                    }]
                }]
            }, {
                name: 'balanceItem',
                component: '::div',
                className: 'app-sa-delivery-card-form-footer-balance-signRight',
                children: [{
                    name: 'balanceAdvanceS',
                    component: '::span',
                    children: '剩余金额：'
                }, {
                    name: 'balanceAdvance',
                    component: '::span',
                    style: '{{{return (data.other.isDisableBank ? {color: "rgba(0, 0, 0, 0.25)"} : {})}}}',
                    children: '{{$calcBalance(data)}}'
                }]
            }, {
                name: 'footer',
                component: 'Layout',
                className: 'ttk-scm-app-sa-invoice-card-footer',
                children: [{
                    name: 'left',
                    component: 'Layout',
                    className: 'ttk-scm-app-sa-invoice-card-footer-left',
                    children: [{
                        name: 'creator',
                        component: 'Layout',
                        children: ['制单人：', '{{data.form.creatorName}}'],
                        style: { marginRight: 30 }
                    }
                        //  {
                        //     name: 'approver',
                        //     component: 'Layout',
                        //     children: ['审核人：', '{{data.form.auditorName}}'],
                        // }
                    ]

                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'ttk-scm-app-sa-invoice-card-footer-right',
                    children: [
                        //     {
                        //     name: 'saveAndNews',
                        //     component: 'Button',
                        //     className: 'app-sa-arrival-card-footer-right-but',
                        //     onClick: '{{function(){$initLoad(null)}}}',
                        //     _visible: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY || data.other.auditVisible || !data.other.auditVisible}}',
                        //     children: '新增'
                        // },
                        {
                            name: 'add',
                            component: 'Button',
                            className: 'app-sa-arrival-card-header-right-but',
                            onClick: '{{function(){$save(true)}}}',
                            _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            children: '保存并新增'
                        }, {
                            name: 'save',
                            component: 'Button',
                            onClick: '{{function(){$save(false)}}}',
                            _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
                            children: '保存'
                        }, {
                            name: 'cancel',
                            component: 'Button',
                            onClick: '{{$add}}',
                            _visible: '{{!data.other.auditVisible && !data.form.discarded}}',
                            // disabled: '{{data.other.pageStatus === data.consts.pageStatus.READ_ONLY}}',
                            children: '放弃'
                        }]
                }]
            }]
        }, /*{
            name: 'footer',
            component: 'Layout',
            className: 'ttk-scm-app-pu-invoice-card-foot-aaa',
        }*/]
    }
}

export function getInitState() {
    return {
        data: {
            error: {},
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
                attachmentLoading: false
            },
            total: {

            },
            other: {
                pageStatus: common.commonConst.PAGE_STATUS.ADD,
                signAndRetreat: [{
                    id: 4000100001,
                    name: "即征即退",
                }, {
                    id: 4000100002,
                    name: "一般项目",
                }],
                isSignAndRetreat: true,
                defaultLength: 5, 	//默认初始行数
                MOVEROW_UP: 0,
                MOVEROW_DOWN: 1,
                detailHeight: '245px',
                isDisableBank: false,
                auditVisible: false,
                voucherStatus: false,
                pageKey: 1
            },
            consts: {
                VOUCHERSTATUS_Approved: consts.consts.VOUCHERSTATUS_Approved,
                SETTLESTATUS_settled: consts.consts.SETTLESTATUS_settled,
                pageStatus: common.commonConst.PAGE_STATUS
            },
            autoFocus: 0
        }
    }
}

export const blankDetail = {
    // warehouseId: null,
    inventoryId: null,
    unitId: null,
    quantity: null,
    // isGift: null,
    price: null,
    // taxInclusivePrice: null,
    taxRateId: null,
    // taxRate:null,
    tax: null,
    amount: null,
    taxInclusiveAmount: null
}
