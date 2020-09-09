import moment from 'moment'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-scm-app-inventory-documents',
        id: 'ttk-scm-app-inventory-documents',
        onMouseDown: '{{$mousedown}}',
        children: [{
            name: 'header',
            component: 'Layout',
            className: 'ttk-scm-app-inventory-documents-header',
            children: [{
                name: 'left',
                component: 'Layout',
                className: 'ttk-scm-app-inventory-documents-header-left',
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
                className: 'ttk-scm-app-inventory-documents-header-right',
                children: [{
                    name: 'shortcut',
                    component: 'Popover',
                    placement: "bottom",
                    overlayClassName: 'ttk-scm-app-inventory-documents-header-left-jianpan',
                    arrowPointAtCenter: true,
                    content: {
                        name: 'keys',
                        component: 'ShortKey',
                        shortCuts: '{{$renderShortCut()}}',
                    },
                    title: null,
                    children: {
                        component: 'Icon',
                        className: 'ttk-scm-app-inventory-documents-header-left-iconbutton',
                        fontFamily: 'edficon',
                        type: 'jianpan',
                        title: '快捷键',
                    }
                }, {
                    name: 'materialAdd',
                    component: 'Dropdown',
                    className: 'btn',
                    _visible: '{{$getProVisible("5001001007")}}',
                    overlay: {
                        name: 'menu',
                        component: 'Menu',
                        onClick: '{{$addDetails}}',
                        children: [{
                            name: 'materialPro',
                            component: 'Menu.Item',
                            key: 'materialPro',
                            disabled: '{{$checkDisabled()}}',
                            children: '选择原料生成'
                        }, {
                            name: 'saleMaterial',
                            component: 'Menu.Item',
                            // key: 'saleMaterial',
                            key: '{{data.other.isNew ? "saleMaterialRatio" : "saleMaterial"}}',
                            disabled: '{{$checkDisabled()}}',
                            _visible: '{{$saleProVisible("out")}}',
                            children: '{{data.other.isNew ? "以销定产按比例生单" : "以销定产生成"}}'
                        }]
                    },
                    children: {
                        name: 'materialOut',
                        component: 'Button',
                        type: 'primary',
                        children: [{
                            name: 'word',
                            component: '::span',
                            children: '自动生单'
                        }, {
                            name: 'more',
                            component: 'Icon',
                            type: 'down'
                        }]
                    }
                }, {
                    name: 'detailsAdd',
                    component: 'Dropdown',
                    className: 'btn',
                    _visible: '{{$getProVisible("5001001003",null)}}',
                    overlay: {
                        name: 'menu',
                        component: 'Menu',
                        onClick: '{{$addDetails}}',
                        children: [{
                            name: 'finishedPro',
                            component: 'Menu.Item',
                            key: 'finishedPro',
                            disabled: '{{$checkDisabled()}}',
                            children: '选择产成品生成'
                        }, {
                            name: 'salePro',
                            component: 'Menu.Item',
                            // key: 'salePro',
                            key: '{{data.other.isNew ? "saleProRatio" : "salePro"}}',
                            disabled: '{{$checkDisabled()}}',
                            _visible: '{{$saleProVisible("in")}}',
                            children: '{{data.other.isNew ? "以销定产按比例生单" : "以销定产生成"}}'
                        }]
                    },
                    children: {
                        name: 'productDetails',
                        component: 'Button',
                        type: 'primary',
                        children: [{
                            name: 'word',
                            component: '::span',
                            children: '自动生单'
                        }, {
                            name: 'more',
                            component: 'Icon',
                            type: 'down'
                        }]
                    }
                },
                /*{
                    name: 'automatic',
                    component: 'Button',
                    onClick: '{{$automaticValue}}',
                    _visible: '{{$getProVisible("5001001003", "aaa") && data.other.type != 4}}',
                    disabled: '{{$checkDisabled()}}',
                    children: '成本核算自动取值'
                },*/
                {
                    name: 'automatic',
                    component: 'Button',
                    onClick: '{{$completeMaticValue}}',
                    // _visible: '{{$getProVisible("5001001003", "aaa") && data.other.type == 4}}',
                    _visible: '{{$getProVisible("5001001003", "aaa")}}',
                    disabled: '{{$checkDisabled()}}',
                    children: '完工成本核算'
                },
                {
                    name: 'share',
                    component: 'Button',
                    onClick: '{{$shareValue}}',
                    _visible: '{{$getProVisible("5001001003", "isColumn")}}',
                    disabled: '{{$checkDisabled()}}',
                    children: '分摊'
                },
                {
                    name: 'saveAndNews',
                    component: 'Button',
                    _visible: '{{data.other.isSaved}}',
                    type: '{{$getProVisible("5001001003") || $getProVisible("5001001007") ? "" : "primary"}}',
                    onClick: '{{function(){$save(true)}}}',
                    children: '保存并新增'
                }, {
                    name: 'saves',
                    component: 'Button',
                    _visible: '{{data.other.isSaved}}',
                    onClick: '{{function(){$save(false)}}}',
                    children: '保存'
                },  {
                    name: 'saves',
                    component: 'Button',
                    _visible: '{{!data.other.isSaved}}',
                    onClick: '{{function(){$newAction()}}}',
                    type: '{{$getProVisible("5001001003") || $getProVisible("5001001007") ? "" : "primary"}}',
                    children: '新增'
                },
                {
                    name: 'audit',
                    component: 'Button',
                    _visible: '{{!data.other.isSaved && data.other.listFlag}}',
                    onClick: '{{$getAudit}}',
                    children: '{{$getAuditBtn()}}'
                },
                {
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
                            disabled: '{{$renderDel() || $checkDisabled()}}',
                            children: '删除'
                        },{
                            name: 'recoil',
                            component: 'Menu.Item',
                            key: 'recoil',
                            _visible: '{{data.form.businessTypeId == "5001001001" && data.other.recoilMode == "1"}}',
                            disabled: '{{$isRecoil() || !data.other.oldFormId}}',
                            children: '暂估回冲'
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
            className: 'ttk-scm-app-inventory-documents-content',
            children: [{
                name: 'title',
                component: 'Layout',
                className: 'ttk-scm-app-inventory-documents-title',
                children: [{
                    name: 'left',
                    component: 'Layout',
                    className: 'ttk-scm-app-inventory-documents-title-left',
                    children: [{
                        component: 'Layout',
                        _visible: '{{$renderPro()}}',
                        className: 'ttk-scm-app-inventory-documents-title-code',
                        children: ['凭证字号:', {
                            name: 'code',
                            component: '::span',
                            className: 'code',
                            style: { marginLeft: 10 },
                            children: '{{$renderDoc()}}',
                            onClick: '{{function() {$openDocContent()}}}',
                        }]
                    }, {
                        name: 'recoiled',
                        component: '::img',
                        className: '{{$renderDoc() ? "ttk-scm-app-inventory-documents-title-recoiled" : "ttk-scm-app-inventory-documents-title-recoiled1"}}',
                        src: './vendor/img/scm/recoiled.png',
                        _visible: '{{$isRecoil() && data.other.recoilMode == "1"}}'
                    }]
                }, {
                    name: 'center',
                    component: '::div',
                    className: 'ttk-scm-app-inventory-documents-title-center',
                    children: {
                        name: 'title',
                        component: '::h1',
                        children: '{{data.other.typeName ? data.other.typeName: this.component.props.inventoryType == "addInventoryIn" ? "入库单" : "出库单"}}'
                    }
                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'ttk-scm-app-inventory-documents-title-right',
                    children: [{
                        name: 'codeA',
                        component: '::span',
                        children: '单据编号:',
                        _visible: "{{!!data.form.code}}"
                    }, {
                        name: 'code',
                        component: '::div',
                        className: 'code',
                        children: "{{data.form.code || ''}}"
                    }, {
                        name: 'attachment',
                        component: 'Attachment',
                        status: '{{data.form.attachmentStatus}}',
                        data: '{{data.form.attachmentFiles}}',
                        onDownload: '{{$download}}',
                        loading: '{{data.form.attachmentLoading}}',
                        visible: '{{data.form.attachmentVisible}}',
                        onDel: '{{$delFile}}',
                        uploadProps: {
                            action: '/v1/edf/file/upload', //上传地址,
                            headers: '{{$getAccessToken()}}',
                            accept: '', //接受的上传类型
                            data: {
                                "fileClassification": "ATTACHMENT"
                            },
                            onChange: '{{$attachmentChange}}',
                            beforeUpload: '{{$beforeUpload}}'
                        }
                    }, {
                        name: 'audited',
                        component: '::img',
                        className: 'ttk-scm-app-inventory-documents-title-img',
                        src: './vendor/img/scm/audited.png',
                        _visible: '{{$renderPro()}}'
                    }]
                }]
            }, {
                name: 'formHeader',
                component: 'Form',
                className: 'ttk-scm-app-inventory-documents-form-header',
                children: '{{$renderFormContent()}}'
            }, {
                name: 'formHeaders',
                component: 'Form',
                className: 'ttk-scm-app-inventory-documents-product',
                _visible: '{{$renderProduct()}}',
                children: [{
                    name: 'span',
                    component: '::span',
                    className: 'productSpan',
                    children: '成本核算'
                }, {
                    name: 'helpPopover',
                    component: 'Popover',
                    content: '生产成本由直接材料、直接人工、制造费用和其他费用四部分组成。点成本核算自动取值：直接材料可以根据材料出库单直接带出，直接人工，制造费用，其他费用可以根据各自对应科目的本月发生额带出。',
                    placement: 'rightTop',
                    overlayClassName: 'ttk-scm-app-inventory-documents-helpPopover',
                    children: {
                        name: 'helpIcon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        type: 'bangzhutishi',
                        className: 'helpIcon'
                    }
                }, {
                    name: 'materialCost',
                    component: 'Form.Item',
                    label: '直接材料',
                    children: [{
                        name: 'materialCost',
                        component: 'Input.Number',
                        className: 'autoFocus_item',
                        disabled: '{{$renderPro("isCost")}}',
                        value: '{{$quantityFormat(data.form.materialCost,2)}}',
                        onBlur: '{{function(v){$changeProNum("data.form.materialCost", v)}}}',
                    }]
                }, {
                    name: 'laborCost',
                    component: 'Form.Item',
                    label: '直接人工（工资）',
                    className: 'product-second',
                    children: [{
                        name: 'laborCost',
                        component: 'Input.Number',
                        className: 'autoFocus_item',
                        disabled: '{{$renderPro("isCost")}}',
                        value: '{{$quantityFormat(data.form.laborCost,2)}}',
                        onBlur: '{{function(v){$changeProNum("data.form.laborCost", v)}}}',
                    }]
                }, {
                    name: 'manufacturCost',
                    component: 'Form.Item',
                    label: '制造费用',
                    children: [{
                        name: 'manufacturCost',
                        component: 'Input.Number',
                        className: 'autoFocus_item',
                        disabled: '{{$renderPro("isCost")}}',
                        value: '{{$quantityFormat(data.form.manufacturCost,2)}}',
                        onBlur: '{{function(v){$changeProNum("data.form.manufacturCost", v)}}}',
                    }]
                }, {
                    name: 'otherCost',
                    component: 'Form.Item',
                    label: '其他费用',
                    children: [{
                        name: 'otherCost',
                        component: 'Input.Number',
                        className: 'autoFocus_item',
                        disabled: '{{$renderPro("isCost")}}',
                        value: '{{$quantityFormat(data.form.otherCost,2)}}',
                        onBlur: '{{function(v){$changeProNum("data.form.otherCost", v)}}}',
                    }]
                }, {
                    name: 'allCost',
                    component: 'Form.Item',
                    label: '合计',
                    className: 'allCost',
                    children: [{
                        name: 'allCost',
                        component: '::div',
                        className: 'autoFocus_item',
                        style: { fontSize: 12 },
                        children: '{{$quantityFormat(data.form.allCost,2,false,"isallCost")}}',
                    }]
                }]
            }, {
                name: 'details',
                component: 'DataGrid',
                className: '{{ $getProVisible("5001001003") ? "ttk-scm-app-inventory-documents-form-details is-two-header":"ttk-scm-app-inventory-documents-form-details"}}',
                headerHeight: 35,
                rowHeight: 35,
                footerHeight: 35,
                groupHeaderHeight: 30,
                rowsCount: '{{data.form.details.length}}',
                enableSequence: true,
                startSequence: 1,
                enableSequenceAddDelrow: '{{!data.other.isAdd}}',
                sequenceFooter: {
                    name: 'footer',
                    component: 'DataGrid.Cell',
                    children: '合计'
                },
                key: '{{data.other.detailHeight}}',
                readonly: false,
                style: '{{{return{height: data.other.detailHeight}}}}',
                onAddrow: "{{$addRow('details')}}",
                onDelrow: "{{$delRow('details')}}",
                onKeyDown: '{{$gridKeydown}}',
                scrollToColumn: '{{data.other.detailsScrollToColumn}}',
                scrollToRow: '{{data.other.detailsScrollToRow}}',
                columns: [{
                    name: 'tg1',
                    component: 'DataGrid.ColumnGroup',
                    header: '产成品',
                    _visible: '{{$getProVisible("5001001003", "isColumn", "isTg")}}',
                    isColumnGroup: true,
                    children: [
                        {
                            name: 'inventoryCode',
                            component: 'DataGrid.Column',
                            columnKey: 'inventoryCode',
                            width: 115,
                            _visible: '{{$getColumnVisible("inventoryCode")}}',
                            header: {
                                name: 'header',
                                className: 'ant-form-item-required',
                                component: 'DataGrid.Cell',
                                children: '存货编码'
                            },
                            cell:{
                                name: 'cell',
                                component: '::div',
                                children:'{{$renderInventoryNameCode(_rowIndex, _ctrlPath, "code")}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            // cell: {
                            //     name: 'cell',
                            //     component: 'Select',
                            //     disabled: '{{data.other.isAdd}}',
                            //     className: '{{$getCellClassName(_ctrlPath)}}',
                            //     showSearch: true,
                            //     allowClear: true,
                            //     title: '{{ data.other.isAdd ? data.form.details[_rowIndex].inventoryCode : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryCode)}}',
                            //     value: '{{ data.other.isAdd ? data.form.details[_rowIndex].inventoryCode : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryCode)}}',
                            //     onChange: '{{$onFieldChange({ code: "data.form.details."+_rowIndex+".inventoryCode",' +
                            //         'id: "data.form.details."+_rowIndex+".inventoryId",' +
                            //         'name: "data.form.details."+_rowIndex+".inventoryName",' +
                            //         'unitId: "data.form.details."+_rowIndex+".unitId",' +
                            //         'unitName: "data.form.details."+_rowIndex+".unitName",' +
                            //         'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                            //         'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                            //         'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                            //         'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventory",_rowIndex, data.form.details[_rowIndex])}}',
                            //     filterOption: '{{$filterOptionCode}}',
                            //     onFocus: '{{function(){$getInventorys()}}}',
                            //     dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                            //     children: {
                            //         name: 'option',
                            //         component: 'Select.Option',
                            //         value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                            //         children: '{{data.other.inventory && data.other.inventory[_lastIndex].code}}',
                            //         _power: 'for in data.other.inventory'
                            //     },
                            //     _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            //     _power: '({rowIndex}) => rowIndex',
                            // }
                        }, {
                            name: 'inventoryName',
                            component: 'DataGrid.Column',
                            columnKey: 'inventoryName',
                            width: 138,
                            _visible: '{{$getColumnVisible("inventoryName")}}',
                            header: {
                                name: 'header',
                                className: 'ant-form-item-required',
                                component: 'DataGrid.Cell',
                                children: '存货名称'
                            },
                            cell:{
                                name: 'cell',
                                component: '::div',
                                children:'{{$renderInventoryNameCode(_rowIndex, _ctrlPath, "name")}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                            // cell: {
                            //     name: 'cell',
                            //     component: 'Select',
                            //     disabled: '{{data.other.isAdd}}',
                            //     className: '{{$getCellClassName(_ctrlPath)}}',
                            //     showSearch: true,
                            //     allowClear: true,
                            //     enableTooltip: false,
                            //     dropdownClassName: 'ttk-scm-app-inventory-documents-inventoryDropdown',
                            //     dropdownStyle: { width: '300px' },
                            //     title: `{{ data.form.details[_rowIndex]&&data.form.details[_rowIndex].inventoryId&&$renderInventoryTitle(data.form.details[_rowIndex].inventoryId,"data.other.inventory",data.form.details[_rowIndex].inventoryName)}}`,
                            //     //title: '{{data.other.isAdd ? data.form.details[_rowIndex].inventoryName : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName)}}',
                            //     value: '{{data.other.isAdd ? data.form.details[_rowIndex].inventoryName : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName)}}',
                            //     onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".inventoryId",' +
                            //         'name: "data.form.details."+_rowIndex+".inventoryName",' +
                            //         'code: "data.form.details."+_rowIndex+".inventoryCode",' +
                            //         'unitId: "data.form.details."+_rowIndex+".unitId",' +
                            //         'unitName: "data.form.details."+_rowIndex+".unitName",' +
                            //         'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                            //         'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                            //         'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                            //         'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventory", _rowIndex, data.form.details[_rowIndex])}}',
                            //     filterOption: '{{$filterOption}}',
                            //     onFocus: '{{function(){$getInventorys(_rowIndex)}}}',
                            //     dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                            //     children: {
                            //         name: 'option',
                            //         component: 'Select.Option',
                            //         value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                            //         title: '{{data.other.inventory && data.other.inventory[_lastIndex].fullName}}',
                            //         children: '{{data.other.inventory && $getFullNameChildren(data.other.inventory[_lastIndex])}}',
                            //         _power: 'for in data.other.inventory'
                            //     },
                            //     _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
                            //     _power: '({rowIndex}) => rowIndex',
                            // }
                        }, {
                            name: 'specification',
                            component: 'DataGrid.Column',
                            columnKey: 'specification',
                            width: 115,
                            _visible: '{{$getColumnVisible("specification")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '规格型号'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled'}}",
                                value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'unit',
                            component: 'DataGrid.Column',
                            columnKey: 'unit',
                            width: 115,
                            _visible: '{{$getColumnVisible("unitName")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '计量单位'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.TextCell',
                                className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled' + ' ttk-scm-app-inventory-documents-cell-center'}}",
                                value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'quantity',
                            component: 'DataGrid.Column',
                            columnKey: 'quantity',
                            width: 102,
                            flexGrow: 1,
                            _visible: '{{$getColumnVisible("quantity")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: 'ant-form-item-required',
                                children: '数量'
                            },
                            cell: {
                                name: 'cell',
                                precision: 6,
                                // component: '{{data.other.isAdd ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath),false,true)}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath),false,true)}}',
                                onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("quantity")}}'
                            }
                        }, {
                            name: 'price',
                            component: 'DataGrid.Column',
                            columnKey: 'price',
                            width: 102,
                            flexGrow: 1,
                            _visible: '{{$getColumnVisible("price")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$renderClass()}}',
                                children: '单价'
                            },
                            cell: {
                                name: 'cell',
                                precision: 6,
                                // component: '{{(data.other.isAdd && $getIsXX()) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].price,6, (data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].price,6, (data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            }
                        }, {
                            name: 'amount',
                            component: 'DataGrid.Column',
                            columnKey: 'amount',
                            width: 102,
                            flexGrow: 1,
                            _visible: '{{$getColumnVisible("amount")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                className: '{{$renderClass()}}',
                                children: '金额'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                // component: '{{(data.other.isAdd && $getIsXX()) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("amount")}}'
                            }
                        }
                    ]
                }, {
                    name: 'tg2',
                    component: 'DataGrid.ColumnGroup',
                    header: '成本项目',
                    _visible: '{{$getProVisible("5001001003", "isColumn", "isTg")}}',
                    isColumnGroup: true,
                    children: [
                        {
                            name: 'absorption',
                            component: 'DataGrid.Column',
                            columnKey: 'absorption',
                            width: 102,
                            // _visible: '{{$getProVisible("5001001003")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '分摊率'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                component: 'Input.Number',
                                maxValue:100,
                                minValue:0,
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].absorption,2) ? $quantityFormat(data.form.details[_rowIndex].absorption,2)+"%" : ""}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].absorption,2) ? $quantityFormat(data.form.details[_rowIndex].absorption,2)+"%" : ""}}',
                                onBlur: '{{$calc("absorption", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("absorption", "isPercent")}}'
                            }
                        }, {
                            name: 'materialCost',
                            component: 'DataGrid.Column',
                            columnKey: 'materialCost',
                            width: 102,
                            // _visible: '{{$getProVisible("5001001003")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '直接材料'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].materialCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].materialCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("materialCost", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("materialCost")}}'
                            }
                        }, {
                            name: ' laborCost',
                            component: 'DataGrid.Column',
                            columnKey: ' laborCost',
                            width: 102,
                            // _visible: '{{$getProVisible("5001001003")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '直接人工'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                // component: '{{(data.other.isAdd && $getIsXX()) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].laborCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].laborCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("laborCost", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("laborCost")}}'
                            }
                        }, {
                            name: 'manufacturCost',
                            component: 'DataGrid.Column',
                            columnKey: 'manufacturCost',
                            width: 102,
                            // _visible: '{{$getProVisible("5001001003")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '制造费用'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                // component: '{{(data.other.isAdd && $getIsXX()) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].manufacturCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].manufacturCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("manufacturCost", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("manufacturCost")}}'
                            }
                        }, {
                            name: 'otherCost',
                            component: 'DataGrid.Column',
                            columnKey: 'otherCost',
                            width: 102,
                            // _visible: '{{$getProVisible("5001001003")}}',
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '其他费用'
                            },
                            cell: {
                                name: 'cell',
                                precision: 2,
                                // component: '{{(data.other.isAdd && $getIsXX()) ? "DataGrid.TextCell" : $isFocus(_ctrlPath)?"Input.Number":"DataGrid.TextCell"}}',
                                component: 'Input.Number',
                                disabled: '{{data.other.isAdd && $getIsXX()}}',
                                className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                                value: '{{$quantityFormat(data.form.details[_rowIndex].otherCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                title: '{{$quantityFormat(data.form.details[_rowIndex].otherCost,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                                onChange: '{{$calc("otherCost", _rowIndex,data.form.details[_rowIndex])}}',
                                _power: '({rowIndex}) => rowIndex',
                            },
                            footer: {
                                name: 'footer',
                                component: 'DataGrid.Cell',
                                className: 'ttk-scm-app-inventory-documents-list-cell-right',
                                children: '{{$sumColumn("otherCost")}}'
                            }
                        }
                    ]
                }, {
                    name: 'inventoryCode',
                    component: 'DataGrid.Column',
                    columnKey: 'inventoryCode',
                    width: 115,
                    _visible: '{{$getColumnVisible("inventoryCode") && !$getProVisible("5001001003", "isColumn", "code")}}',
                    header: {
                        name: 'header',
                        className: 'ant-form-item-required',
                        component: 'DataGrid.Cell',
                        children: '存货编码'
                    },
                    cell:{
                        name: 'cell',
                        component: '::div',
                        children:'{{$renderInventoryNameCode(_rowIndex, _ctrlPath, "code")}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                    // cell: {
                    //     name: 'cell',
                    //     component: 'Select',
                    //     disabled: '{{data.other.isAdd}}',
                    //     className: '{{$getCellClassName(_ctrlPath)}}',
                    //     showSearch: true,
                    //     allowClear: true,
                    //     title: '{{ data.other.isAdd ? data.form.details[_rowIndex].inventoryCode : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryCode)}}',
                    //     value: '{{ data.other.isAdd ? data.form.details[_rowIndex].inventoryCode : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryCode)}}',
                    //     onChange: '{{$onFieldChange({ code: "data.form.details."+_rowIndex+".inventoryCode",' +
                    //         'id: "data.form.details."+_rowIndex+".inventoryId",' +
                    //         'name: "data.form.details."+_rowIndex+".inventoryName",' +
                    //         'unitId: "data.form.details."+_rowIndex+".unitId",' +
                    //         'unitName: "data.form.details."+_rowIndex+".unitName",' +
                    //         'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                    //         'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                    //         'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                    //         'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventory",_rowIndex, data.form.details[_rowIndex])}}',
                    //     filterOption: '{{$filterOptionCode}}',
                    //     onFocus: '{{function(){$getInventorys(_rowIndex)}}}',
                    //     dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                    //     children: {
                    //         name: 'option',
                    //         component: 'Select.Option',
                    //         value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                    //         children: '{{data.other.inventory && data.other.inventory[_lastIndex].code}}',
                    //         _power: 'for in data.other.inventory'
                    //     },
                    //     _power: '({rowIndex}) => rowIndex',
                    // }
                }, {
                    name: 'inventoryName',
                    component: 'DataGrid.Column',
                    columnKey: 'inventoryName',
                    width: '{{$getProVisible("5001001009") ? 202 : 102}}',
                    flexGrow: '{{$getProVisible("5001001009") ? 0 : 1}}',
                    _visible: '{{$getColumnVisible("inventoryName") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        className: 'ant-form-item-required',
                        component: 'DataGrid.Cell',
                        children: '存货名称'
                    },
                    cell:{
                        name: 'cell',
                        component: '::div',
                        children:'{{$renderInventoryNameCode(_rowIndex, _ctrlPath, "name")}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                    // cell: {
                    //     name: 'cell',
                    //     component: 'Select',
                    //     disabled: '{{data.other.isAdd}}',
                    //     className: '{{$getCellClassName(_ctrlPath)}}',
                    //     showSearch: true,
                    //     allowClear: true,
                    //     enableTooltip: false,
                    //     dropdownClassName:'ttk-scm-app-inventory-documents-inventoryDropdown',
                    //     dropdownMatchSelectWidth: false,
                    //     dropdownStyle: { width: '300px' },
                    //     title: `{{ data.form.details[_rowIndex]&&data.form.details[_rowIndex].inventoryId&&$renderInventoryTitle(data.form.details[_rowIndex].inventoryId,"data.other.inventory",data.form.details[_rowIndex].inventoryName)}}`,
                    //     //title: '{{data.other.isAdd ? data.form.details[_rowIndex].inventoryName : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName)}}',
                    //     value: '{{data.other.isAdd ? data.form.details[_rowIndex].inventoryName : ($isFocus(_ctrlPath) ? data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryId : data.form.details[_rowIndex].inventoryName)}}',
                    //     onChange: '{{$onFieldChange({ id: "data.form.details."+_rowIndex+".inventoryId",' +
                    //         'name: "data.form.details."+_rowIndex+".inventoryName",' +
                    //         'code: "data.form.details."+_rowIndex+".inventoryCode",' +
                    //         'unitId: "data.form.details."+_rowIndex+".unitId",' +
                    //         'unitName: "data.form.details."+_rowIndex+".unitName",' +
                    //         'propertyName: "data.form.details."+_rowIndex+".propertyName",' +
                    //         'propertyDetailName: "data.form.details."+_rowIndex+".propertyDetailName",' +
                    //         'taxRateName: "data.form.details."+_rowIndex+".taxRateName",' +
                    //         'specification: "data.form.details."+_rowIndex+".specification"}, "data.other.inventory", _rowIndex, data.form.details[_rowIndex])}}',
                    //     filterOption: '{{$filterOption}}',
                    //     onFocus: '{{function(){$getInventorys(_rowIndex)}}}',
                    //     dropdownFooter: "{{$handleAddRecord('Inventory', 'inventory', _rowIndex, data.form.details[_rowIndex])}}",
                    //     children: {
                    //         name: 'option',
                    //         component: 'Select.Option',
                    //         value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
                    //         title: '{{data.other.inventory && data.other.inventory[_lastIndex].fullName}}',
                    //         children: '{{data.other.inventory && $getFullNameChildren(data.other.inventory[_lastIndex])}}',
                    //         _power: 'for in data.other.inventory'
                    //     },
                    //     _power: '({rowIndex}) => rowIndex',

                    // }
                }, {
                    name: 'specification',
                    component: 'DataGrid.Column',
                    columnKey: 'specification',
                    width: 115,
                    _visible: '{{$getColumnVisible("specification") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '规格型号'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].specification}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'unit',
                    component: 'DataGrid.Column',
                    columnKey: 'unit',
                    width: 115,
                    _visible: '{{$getColumnVisible("unitName") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '计量单位'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled' + ' ttk-scm-app-inventory-documents-cell-center'}}",
                        value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                        title: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].unitName}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'periodEndQuantity',
                    component: 'DataGrid.Column',
                    columnKey: 'periodEndQuantity',
                    width: 115,
                    _visible: '{{data.other.type == 4 && $getProVisible("5001001003", null)}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '结存数量'
                    },
                    cell: {
                        name: 'cell',
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled' + ' ttk-scm-app-inventory-documents-cell-right'}}",
                        value: '{{data.form.details[_rowIndex] && $endQuantity(data.form.details[_rowIndex].periodEndQuantity)}}',
                        title: '{{data.form.details[_rowIndex] && $endQuantity(data.form.details[_rowIndex].periodEndQuantity)}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                },{
                    name: 'periodEndAmount',
                    component: 'DataGrid.Column',
                    columnKey: 'periodEndAmount',
                    width: 115,
                    _visible: '{{data.other.type == 4 && $getProVisible("5001001003", null)}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        children: '结存金额'
                    },
                    cell: {
                        name: 'cell',  
                        component: 'DataGrid.TextCell',
                        className: "{{$getCellClassName(_ctrlPath) + ' ttk-scm-app-inventory-documents-cell-disabled' + ' ttk-scm-app-inventory-documents-cell-right'}}",
                        value: '{{data.form.details[_rowIndex] && $endAmount(data.form.details[_rowIndex].periodEndAmount)}}',
                        title: '{{data.form.details[_rowIndex] && $endAmount(data.form.details[_rowIndex].periodEndAmount)}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                },{
                    name: 'quantity',
                    component: 'DataGrid.Column',
                    columnKey: 'quantity',
                    width: 102,
                    flexGrow: 1,
                    _visible: '{{$getColumnVisible("quantity") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: 'ant-form-item-required',
                        children: '数量'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: 'Input.Number',
                        disabled: '{{data.other.isAdd}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath),false,true)}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].quantity,6,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath),false,true)}}',
                        onChange: '{{$calc("quantity", _rowIndex, data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-inventory-documents-list-cell-right',
                        children: '{{$sumColumn("quantity")}}'
                    }
                }, {
                    name: 'price',
                    component: 'DataGrid.Column',
                    columnKey: 'price',
                    width: 102,
                    flexGrow: 1,
                    _visible: '{{$getColumnVisible("price") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: '{{$renderClass()}}',
                        children: '单价'
                    },
                    cell: {
                        name: 'cell',
                        precision: 6,
                        component: 'Input.Number',
                        disabled: '{{data.other.isAdd && $getIsXX()}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].price,6, (data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].price,6, (data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("price", _rowIndex,data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    }
                }, {
                    name: 'amount',
                    component: 'DataGrid.Column',
                    columnKey: 'amount',
                    width: '{{$getProVisible("5001001009") ? 202 : 102}}',
                    flexGrow: '{{$getProVisible("5001001009") ? 0 : 1}}',
                    _visible: '{{$getColumnVisible("amount") && !$getProVisible("5001001003", "isColumn")}}',
                    header: {
                        name: 'header',
                        component: 'DataGrid.Cell',
                        className: '{{$renderClass()}}',
                        children: '金额'
                    },
                    cell: {
                        name: 'cell',
                        precision: 2,
                        component: 'Input.Number',
                        disabled: '{{data.other.isAdd && $getIsXX()}}',
                        className: '{{$getCellClassName(_ctrlPath) + " ttk-scm-app-inventory-documents-cell ttk-scm-app-inventory-documents-cell-right"}}',
                        value: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                        title: '{{$quantityFormat(data.form.details[_rowIndex].amount,2,(data.other.isAdd && $getIsXX()) ? false:$isFocus(_ctrlPath))}}',
                        onChange: '{{$calc("amount", _rowIndex,data.form.details[_rowIndex])}}',
                        _power: '({rowIndex}) => rowIndex',
                    },
                    footer: {
                        name: 'footer',
                        component: 'DataGrid.Cell',
                        className: 'ttk-scm-app-inventory-documents-list-cell-right',
                        children: '{{$sumColumn("amount")}}'
                    }
                }]
            }, {
                name: 'footer',
                component: '::div',
                className: 'ttk-scm-app-inventory-documents-footer',
                children: [{
                    name: 'left',
                    component: 'Layout',
                    className: 'ttk-scm-app-inventory-documents-footer-left',
                    children: [{
                        name: 'creator',
                        component: 'Layout',
                        children: ['制单人：', '{{data.form.creatorName}}'],
                    }]
                }, {
                    name: 'right',
                    component: 'Layout',
                    className: 'ttk-scm-app-inventory-documents-footer-right',
                    _visible: '{{data.other.isSaved}}',
                    children: [{
                        name: 'saveAndNew',
                        component: 'Button',
                        type: 'primary',
                        onClick: '{{function(){$save(true)}}}',
                        children: '保存并新增'
                    }, {
                        name: 'save',
                        component: 'Button',
                        onClick: '{{function(){$save(false)}}}',
                        children: '保存'
                    }, {
                        name: 'cancel',
                        component: 'Button',
                        onClick: '{{$add}}',
                        children: '放弃'
                    }]
                }]
            }]
        }]
    }
}

export function getInitState(option) {
    return {
        data: {
            form: {
                isEnable: true,
                code: undefined,
                attachmentLoading: false,
                attachmentStatus: 0,  //可编辑0， 只读1
                allCost: 0,
                details: [
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail,
                    blankDetail
                ],
                businessTypeId: null,
                materialCost: null,
                laborCost: null,
                manufacturCost: null,
                otherCost: null,
                // manufacturCost: [],
                businessDate: moment().endOf('day'),
                settles: [{
                    bankAccountId: '',
                    amount: '',
                    bankAccountName: ''
                }]
            },
            total: {

            },
            other: {
                defaultLength: 8, //默认初始行数
                listFlag: false,
                MOVEROW_UP: 0,
                MOVEROW_DOWN: 1,
                detailHeight: 8,
                isDisableBank: false,
                bussinessType: [],
                enableDate: moment().format('YYYY-MM-DD'),
                // typeName: '库存单据',
                typeName: '',
                docList: [],
                isOk: true,
                vouchered: false, // 是否生成凭证
                isAdd: false,  // 是否是新增的单据
                isSaved: true,  //保存按钮是否显示
                typeAble: false,  // 业务类型是否可编辑
                prevDisalbed: false,
                nextDisalbed: false,
                isNew: false, // 以销定产成本占收入比例生单，false 不按比例，显示分摊列
                detailAmountTotal: '' ,
                recoilFlag: false, //  采购入库单是否已回冲
                productAmount: '', //生产入库成本
            },
            setting: {}
        }
    }
}

export const blankDetail = {
    inventoryCode: undefined,
    inventoryName: undefined,
    specification: null,
    unit: null,
    quantity: null,
    price: null,
    amount: null,
    absorption: null,
    materialCost: null,
    laborCost: null,
    manufacturCost: null,
    otherCost: null,
}