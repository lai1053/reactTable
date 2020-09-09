export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-app-inventory-card',
        children: [{
            name: 'form',
            component: 'Form',
            className: 'ttk-app-inventory-card-form',
            children: [{
                    name: 'popover',
                    component: 'Popover',
                    // popupClassName: 'ttk-app-inventory-card-popover',
                    popupClassName: '{{ data.form.alias ? "ttk-app-inventory-card-popover" : "ttk-app-inventory-card-popover ttk-app-inventory-card-bottom"}}',
                    getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                    placement: '{{ data.form.alias ? "bottomRight" : "bottom"}}',
                    title: '',
                    content: {
                        name: 'popover-content',
                        component: '::div',
                        className: 'content',
                        children: [{
                            name: 'filter-header',
                            component: '::div',
                            className: 'filter-header',
                            children: [{
                                name: 'title',
                                component: '::span',
                                children: '添加别名'
                            }, {
                                name: 'title1',
                                component: '::span',
                                children: '×',
                                className: 'cha',
                                onClick: '{{$cancelOtherName}}'
                            }]
                        }, {
                            name: 'filter-content',
                            component: '::div',
                            className: 'filter-content',
                            children: '{{$renderOtherName()}}'
                        }, {
                            name: 'filter-footer',
                            component: '::div',
                            className: 'filter-footer',
                            children: [{
                                    name: 'search',
                                    component: 'Button',
                                    type: 'primary',
                                    children: '保存',
                                    onClick: '{{$saveOtherName}}'
                                },
                                {
                                    name: 'reset',
                                    className: 'reset-btn',
                                    component: 'Button',
                                    children: '取消',
                                    onClick: '{{$cancelOtherName}}'
                                }
                            ]
                        }]
                    },
                    trigger: 'click',
                    visible: '{{data.showPopoverCard}}',
                    onVisibleChange: "{{$handlePopoverVisibleChange}}",
                    children: {
                        name: 'filterSpan',
                        component: '::span',
                        _visible: '{{data.form.propertyId ? true : false}}',
                        className: '{{ data.form.alias ? "filter-btn" : "filter-btn1"}}',
                        children: {
                            name: 'filter',
                            component: '::a',
                            style: { fontSize: 12 },
                            children: '+别名'
                        }
                    }
                },
                {
                    name: 'propertyItem',
                    component: 'Form.Item',
                    label: '存货类型',
                    className: 'ttk-app-inventory-card-form-sort',
                    required: true,
                    validateStatus: '{{data.other.error.property?\'error\':\'success\'}}',
                    help: '{{data.other.error.property}}',
                    children: {
                        name: 'property',
                        component: 'Select',
                        showSearch: false,
                        placeholder: '请选择存货类型',
                        optionFilterProp: 'children',
                        value: '{{data.form.propertyId}}',
                        title: '{{data.form.propertyId}}',
                        onChange: '{{function(e){$sf("data.form.propertyId", e);$propertyChange(e)}}}',
                        dropdownClassName: 'ttk-app-inventory-card-taxDropdown',
                        children: {
                            name: 'selectItem',
                            component: 'Select.Option',
                            value: '{{data.other.property[_rowIndex].id}}',
                            children: '{{data.other.property[_rowIndex].name}}',
                            _power: 'for in data.other.property'
                        }
                    }
                }, {
                    name: 'line',
                    component: 'Layout',
                    className: 'title',
                    children: [{
                        name: 'line1',
                        className: 'line1',
                        component: '::span',
                        children: ''
                    }, {
                        name: 'info',
                        className: 'info',
                        component: '::span',
                        children: '存货信息：'
                    }, {
                        name: 'line',
                        className: 'line',
                        component: '::span',
                        children: ''
                    }]
                }, {
                    name: 'codeItem',
                    component: 'Form.Item',
                    label: '存货编号',
                    required: true,
                    validateStatus: '{{data.other.error.code?\'error\':\'success\'}}',
                    help: '{{data.other.error.code}}',
                    children: {
                        name: 'code',
                        component: 'Input',
                        placeholder: '请输入存货编号',
                        disabled: '{{data.form.propertyId && !data.other.isUsed ? false : true}}',
                        maxlength: 8,
                        value: '{{data.form.propertyId ? data.form.code : ""}}',
                        title: '{{data.form.propertyId ? data.form.code : ""}}',
                        onChange: '{{function(e){$sf(\'data.form.code\',e.target.value);$changeCheck("code")}}}'
                    }
                }, {
                    name: 'nameItem',
                    component: 'Form.Item',
                    label: '存货名称',
                    required: true,
                    validateStatus: '{{data.other.error.name?\'error\':\'success\'}}',
                    help: '{{data.other.error.name}}',
                    children: {
                        name: 'name',
                        component: 'Input',
                        placeholder: '请输入存货名称',
                        disabled: '{{(data.form.propertyId || data.other.moduleYW) && !data.other.isUsed ? false : true}}',
                        maxlength: 30,
                        value: '{{data.form.name}}',
                        title: '{{data.form.name}}',
                        onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck("name")}}}`
                    }
                }, {
                    name: 'sizeItem',
                    component: 'Form.Item',
                    label: '规格型号',
                    // validateStatus: '{{data.other.error.specification?\'error\':\'success\'}}',
                    // help: '{{data.other.error.specification}}',
                    children: {
                        name: 'specification',
                        component: 'Input',
                        maxlength: 30,
                        placeholder: '请输入规格型号',
                        disabled: '{{(data.form.propertyId || data.other.moduleYW) && !data.other.isUsed ? false : true}}',
                        value: '{{data.form.specification}}',
                        title: '{{data.form.specification}}',
                        onChange: '{{function(e){$sf(\'data.form.specification\',e.target.value)}}}'
                    }
                }, {
                    name: 'otherName',
                    component: 'Form.Item',
                    label: '别名',
                    children: {
                        name: 'otherName',
                        component: 'Input',
                        placeholder: '{{data.form.propertyId ? "" : "+别名"}}',
                        readonly: 'readonly',
                        className: 'card-alias',
                        disabled: '{{data.form.propertyId ? false : true}}',
                        value: '{{data.form.alias}}',
                        title: '{{data.form.alias}}',
                        onFocus: '{{function(){$sf(\'data.showPopoverCard\', true)}}}',
                    }
                }, {
                    name: 'unitId',
                    component: 'Form.Item',
                    label: '计量单位组',
                    required: true,
                    validateStatus: '{{data.other.error.unitId?\'error\':\'success\'}}',
                    help: '{{data.other.error.unitId}}',
                    children: {
                        name: 'unitId',
                        component: 'Select',
                        placeholder: '请选择计量单位组',
                        disabled: '{{data.form.propertyId ? false : true}}',
                        filterOptionExpressions: 'code,name,groupName,helpCode,helpCodeFull',
                        value: '{{data.form.unit && data.form.unit.id}}',
                        title: '{{data.form.unit && data.form.unit.id}}',
                        onChange: `{{function(v){$fieldChange('data.form.unit',data.other.unitList.filter(function(data){return data.id == v})[0])}}}`,
                        dropdownClassName: 'ttk-app-inventory-card-taxDropdown',
                        children: {
                            name: 'selectItem',
                            component: 'Select.Option',
                            value: '{{data.other.unitList[_rowIndex].id}}',
                            title: '{{data.other.unitList[_rowIndex].groupName}}',
                            children: '{{data.other.unitList[_rowIndex].groupName}}',
                            _power: 'for in data.other.unitList'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{$addUnit}}"
                        }
                    }
                }, {
                    name: 'account',
                    component: 'Form.Item',
                    label: '存货科目',
                    required: true,
                    validateStatus: '{{data.other.error.account?\'error\':\'success\'}}',
                    help: '{{data.other.error.account}}',
                    children: {
                        name: 'account',
                        component: 'Select',
                        placeholder: '请选择存货科目',
                        disabled: '{{data.form.propertyId ? false : true}}',
                        filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
                        value: '{{data.form.account && data.form.account.id}}',
                        title: '{{data.form.account && data.form.account.id}}',
                        onChange: `{{function(v){$fieldChange('data.form.account',data.glAccounts.filter(function(data){return data.id == v})[0])}}}`,
                        dropdownClassName: 'ttk-app-inventory-card-taxDropdown',
                        children: {
                            name: 'selectItem',
                            component: 'Select.Option',
                            value: '{{data.glAccounts[_rowIndex].id}}',
                            title: '{{data.glAccounts[_rowIndex].codeAndName}}',
                            children: '{{data.glAccounts[_rowIndex].codeAndName}}',
                            _power: 'for in data.glAccounts'
                        },
                        dropdownFooter: {
                            name: 'add',
                            component: 'Button',
                            type: 'primary',
                            style: { width: '100%', borderRadius: '0' },
                            children: '新增',
                            onClick: "{{$addAccount}}"
                        }
                    }
                }
            ]
        }, {
            name: 'footer',
            component: '::div',
            className: 'ttk-app-inventory-card-footer',
            children: [{
                name: 'btnGroup',
                component: '::div',
                className: 'ttk-app-inventory-card-footer-btnGroup',
                children: [{
                    name: 'cancel',
                    component: 'Button',
                    className: 'ttk-app-inventory-card-footer-btnGroup-item',
                    children: '取消',
                    onClick: '{{$onCancel}}'
                }, {
                    name: 'confirm',
                    component: 'Button',
                    className: 'ttk-app-inventory-card-footer-btnGroup-item',
                    type: 'primary',
                    children: '保存',
                    onClick: "{{function(e){$save('save')}}}"
                }, {
                    name: 'saveAndNew',
                    component: 'Button',
                    _visible: '{{!data.other.moduleYW}}',
                    className: 'ttk-app-inventory-card-footer-btnGroup-item',
                    type: 'primary',
                    children: '保存并新增',
                    onClick: "{{function(e){$save('saveAndNew')}}}"
                }]
            }]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            showPopoverCard: false,
            newAlias: [{ sequenceNo: 1, name: null }],
            otherName: [{ sequenceNo: 1, name: null }],
            form: {
                code: '',
                name: '',
                property: '123',
                isEnable: true
            },
            isProperty: false,
            other: {
                revenueType: [],
                error: {},
                moduleYW: false,
            },
            taxCode: {
                data: [],
                value: [],
                fetching: false
            },
            queryByparamKeys: {
                CertificationGeneration_InventoryAccount: "default",
                CertificationGeneration_SalesCostAccount: "default"
            }
        }
    };
}