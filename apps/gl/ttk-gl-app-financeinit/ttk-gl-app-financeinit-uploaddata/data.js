// import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-financeinit-uploaddata',
        children: {
            name: 'spin',
            component: 'Spin',
            tip: '数据加载中...',
            className: 'spinContainer',
            // spinning:true,
            spinning: '{{data.loading}}',
            size: 'large',
            children: [{
                name: 'content',
                component: '::div',
                className: 'ttk-gl-app-financeinit-uploaddata-body',
                children: [{
                    name: 'content1',
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-uploaddata-body-content',
                    children: [{
                        name: 'header',
                        component: 'Form',
                        className: 'ttk-gl-app-financeinit-uploaddata-body-content-header',
                        children: [{
                            name: 'item',
                            component: 'Form.Item',
                            label: '企业名称',
                            //  value:'dazhong',
                            children: {
                                name: 'title',
                                component: '::span',
                                children: '{{data.form.name}}'
                            }
                        }, {
                            name: 'item',
                            component: 'Form.Item',
                            label: '纳税人性质',
                            className: 'ttk-gl-app-financeinit-uploaddata-body-content-header-vatTaxpayer',
                            // required: true,
                            // help: '{{data.other.error.code}}',
                            // validateStatus: "{{data.other.error.code?'error':'success'}}",
                            children: [{
                                name: 'vatTaxpayer',
                                component: 'Select',
                                _visible: '{{data.other.isEdit?true:false}}',
                                disabled: '{{!data.other.modifyStatus}}',
                                getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-financeinit-uploaddata-body-content-header-vatTaxpayer")}}}',
                                showSearch: false,
                                value: '{{data.form.vatTaxpayer=="2000010001"?"一般纳税人":"小规模纳税人"}}',
                                onChange: "{{function(e){$setField('data.form.vatTaxpayer',e)}}}",
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.form.vatTaxpayerEnum[_rowIndex].id}}',
                                    children: '{{data.form.vatTaxpayerEnum[_rowIndex].name}}',
                                    _power: 'for in data.form.vatTaxpayerEnum',
                                }
                            },
                            {
                                name: 'vatTaxpayer',
                                component: '::div',
                                _visible: '{{data.other.isEdit?false:true}}',
                                children: '{{data.form.vatTaxpayer=="2000010001"?"一般纳税人":"小规模纳税人"}}'
                            }
                            ]
                        }, {
                            name: 'item',
                            component: 'Form.Item',
                            label: '启用期间',
                            // required: true,
                            // help: '{{data.other.error.code}}',
                            // validateStatus: "{{data.other.error.code?'error':'success'}}",
                            children: [{
                                name: 'monthPicker',
                                component: 'DatePicker.MonthPicker',
                                // disabled: '{{!data.other.modifyStatus}}',
                                value: '{{$stringToMoment(data.form.periodDate)}}',
                                _visible: '{{data.other.isEdit?true:false}}',
                                // disabledDate: `{{function(current){ var disabledDate = new Date(data.other.disabledDate)
                                //     return current && current.valueOf() < disabledDate
                                // }}}`,
                                onChange: `{{function(d){$setField('data.form.periodDate', $momentToString(d,'YYYY-MM'))}}}`,
                            },
                            {
                                name: 'periodDate',
                                component: '::div',
                                _visible: '{{data.other.isEdit?false:true}}',
                                children: '{{data.form.periodDate}}'
                            }
                            ]
                        }, {
                            name: 'item',
                            component: 'Form.Item',
                            label: '会计准则',
                            className: 'ttk-gl-app-financeinit-uploaddata-body-content-header-accountingStandards',
                            children: [{
                                name: 'select',
                                component: 'Select',
                                disabled: '{{!data.other.modifyStatus}}',
                                getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-financeinit-uploaddata-body-content-header-accountingStandards")}}}',
                                showSearch: false,
                                _visible: '{{data.other.isEdit?true:false}}',
                                value: '{{$getaccountingStandardsText()}}',
                                onChange: "{{function(e){$setField('data.form.accountingStandards',e)}}}",
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.form.accountingStandardsEnum[_rowIndex].id}}',
                                    title: '{{data.form.accountingStandardsEnum[_rowIndex].name}}',
                                    children: '{{data.form.accountingStandardsEnum[_rowIndex].name}}',
                                    _power: 'for in data.form.accountingStandardsEnum',
                                }
                            }, {
                                name: 'accountingStandards',
                                component: '::div',
                                _visible: '{{data.other.isEdit?false:true}}',
                                children: '{{$getaccountingStandardsText()}}'
                            }]
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            type: 'bianji',
                            fontFamily: 'edficon',
                            // disabled: '{{!data.other.modifyStatus}}',
                            className: 'itemIcon',
                            _visible: '{{data.other.isEdit?false:true}}',
                            onClick: '{{function(){$edit()}}}'
                        }, {
                            name: 'btn',
                            component: 'Button',
                            children: '完成',
                            type: 'primary',
                            className: 'saveBtn',
                            _visible: '{{data.other.isEdit?true:false}}',
                            onClick: '{{function(){$editSave()}}}'
                        }
                        ]
                    },
                    {
                        name: 'body',
                        component: '::div',
                        className: 'ttk-gl-app-financeinit-uploaddata-body-content-middle',
                        children: [
                            {
                                name: 'item',
                                component: '::div',
                                className: 'ttk-gl-app-financeinit-uploaddata-body-content-middle-item',
                                children: {
                                    name: 'container',
                                    component: '::div',
                                    className: 'itemContainer',
                                    children: [
                                        {
                                            name: 'div1',
                                            component: 'Form.Item',
                                            className: 'formItem',
                                            children: [
                                                {
                                                    name: 'sel',
                                                    component: 'Select',
                                                    className: '{{data.other.disabled?"itemSelect highLightSelect":"itemSelect"}}',
                                                    placeholder: '下拉选取财务软件',
                                                    dropdownClassName: '{{data.other.disabled?"ttk-gl-app-financeinit-uploaddata-select highLightSelect":"ttk-gl-app-financeinit-uploaddata-select"}}',
                                                    value: '{{data.form.templateType}}',
                                                    onChange: '{{function(e){$fiSoftChange("data.form.templateType",e)}}}',
                                                    children: {
                                                        name: 'option',
                                                        component: 'Select.Option',
                                                        value: '{{data.form.templateData[_rowIndex].key}}',
                                                        children: '{{data.form.templateData[_rowIndex].name}}',
                                                        _power: 'for in data.form.templateData',
                                                    }
                                                }, {
                                                    name: 'div2',
                                                    component: '::div',
                                                    _visible: '{{data.downloadTempShow}}',
                                                    style: { fontSize: '12px', height: '18px', lineHeight: '18px', textAlign: 'right' },
                                                    children: [{
                                                        name: 'span1',
                                                        component: '::span',
                                                        children: '请'
                                                    }, {
                                                        name: 'common1',
                                                        component: 'Dropdown',
                                                        className: 'dropdown',
                                                        overlay: {
                                                            name: 'menu',
                                                            component: 'Menu',
                                                            onClick: '{{$leadInTemplate}}',
                                                            children: [{
                                                                name: 'amountFormula',
                                                                component: 'Menu.Item',
                                                                key: '0',
                                                                children: '金额式'
                                                            }, {
                                                                name: 'quantyAmountFormula',
                                                                component: 'Menu.Item',
                                                                key: '1',
                                                                children: '数量金额式'
                                                            },{
                                                                name: 'quantyCurrencyFormula',
                                                                component: 'Menu.Item',
                                                                key: '2',
                                                                children: '数量外币式'
                                                            },{
                                                                name: 'multiPageQuantyAmountFormula',
                                                                component: 'Menu.Item',
                                                                key: '3',
                                                                children: '多页签数量金额式'
                                                            }
                                                        ]
                                                        },
                                                        children: {
                                                            name: 'internal',
                                                            component: 'Button',
                                                            type: 'primary',
                                                            children: ['下载模板', {
                                                                name: 'down',
                                                                component: 'Icon',
                                                                fontFamily: 'edficon',
                                                                type: 'xia',
                                                                className: 'downicon'
                                                            }]
                                                        }
                                                    }, {
                                                        name: 'span3',
                                                        component: '::span',
                                                        children: '，填好数据后导入',
                                                    }]
                                                }
                                            ]
                                        },
                                        {
                                            name: 'div2',
                                            component: 'Form.Item',
                                            className: 'formItem',
                                            children: [
                                                {
                                                    name: 'sub',
                                                    component: 'Input',
                                                    style: { width: '299px', marginRight: '5px', overflow: 'hidden', whiteSpace: 'nowrap', height:'30px',textOverflow: 'ellipsis' },
                                                    placeholder: '上传excel文件',
                                                    disabled: '{{data.other.disabled}}',
                                                    value: '{{data.fileName}}',
                                                    readonly: 'readonly',
                                                    title: '{{data.fileName}}'
                                                }, {
                                                    name: 'update-balancesheet-item-content',
                                                    component: '::div',
                                                    type: 'primary',
                                                    _visible: '{{data.other.isMonthly?false: true}}',
                                                    className: 'ttk-gl-app-financeinit-uploaddata-content',
                                                    children: '{{$renderUpload()}}'
                                                },
                                                // {
                                                //     name: 'upload',
                                                //     component: 'Upload',
                                                //     _visible: '{{data.other.isMonthly?false: true}}',
                                                //     beforeUpload: '{{$beforeLoad}}',
                                                //     children: [{
                                                //        name: 'openingBankItem',
                                                //        className:'uploadFile',
                                                //        component: 'Button',
                                                //        disabled: '{{data.other.disabled}}',
                                                //        children: '{{data.file ? "重选文件" :"选择文件"}}'
                                                //    }],
                                                //    onChange: '{{$handleOnChange}}',
                                                //    showUploadList: false,
                                                //    action: '/v1/edf/file/upload',
                                                //    headers: '{{$getAccessToken()}}',
                                                //     accept:'.xls, .xlsx'
                                                // },
                                                {
                                                    name: 'btn',
                                                    component: 'Button',
                                                    _visible: '{{data.other.isMonthly?true: false}}',
                                                    children: '选择文件',
                                                    onClick: '{{$handleUpload}}'
                                                }
                                            ]
                                        },
                                        {
                                            name: 'tip',
                                            component: '::div',
                                            className: 'text',
                                            _visible: '{{data.form.accountingStandards == 2000020008}}',
                                            children: [{
                                                name: 'mode0',
                                                component: '::div',
                                                className: 'mode',
                                                children: '支持下方两种方式：'
                                            }, {
                                                name: 'mode2',
                                                component: '::div',
                                                className: 'mode',
                                                children: [{
                                                    name: 'text1',
                                                    component: '::span',
                                                    children: '1.标准模板导入，'
                                                }, {
                                                    name: 'common',
                                                    component: 'Dropdown',
                                                    className: 'dropdown',
                                                    overlay: {
                                                        name: 'menu',
                                                        component: 'Menu',
                                                        onClick: '{{$leadInTemplate}}',
                                                        children: [{
                                                            name: 'amountFormula',
                                                            component: 'Menu.Item',
                                                            key: '0',
                                                            children: '金额式'
                                                        }, {
                                                            name: 'quantyAmountFormula',
                                                            component: 'Menu.Item',
                                                            key: '1',
                                                            children: '数量金额式'
                                                        },
                                                        {
                                                            name: 'quantyCurrencyFormula',
                                                            component: 'Menu.Item',
                                                            key: '2',
                                                            children: '数量外币式'
                                                        },{
                                                            name: 'multiPageQuantyAmountFormula',
                                                            component: 'Menu.Item',
                                                            key: '3',
                                                            children: '多页签数量金额式'
                                                        }
                                                    ]
                                                    },
                                                    children: {
                                                        name: 'internal',
                                                        component: 'Button',
                                                        type: 'primary',
                                                        children: ['下载标准模板', {
                                                            name: 'down',
                                                            component: 'Icon',
                                                            fontFamily: 'edficon',
                                                            type: 'xia',
                                                            className: 'downicon'
                                                        }]
                                                    }
                                                }, {
                                                    name: 'text3',
                                                    component: '::span',
                                                    children: ' ，完善期初数据后将文件导入生成期初余额'
                                                }]
                                            },
                                            {
                                                name: 'mode3',
                                                component: '::div',
                                                className: 'mode',
                                                children: [{
                                                    name: 'text1',
                                                    component: '::span',
                                                    children: '2.在科目期初页面直接'
                                                }, {
                                                    name: 'text2',
                                                    component: 'Button',
                                                    className: 'handwork',
                                                    children: ' 手工录入期初余额 ',
                                                    onClick: '{{function(){$handwork()}}}'
                                                }, {
                                                    name: 'text3',
                                                    component: '::span',
                                                    children: '完成初始化'
                                                }
                                                ]
                                            }]
                                        },
                                        {
                                            name: 'tip',
                                            component: '::div',
                                            className: 'text',
                                            _visible: '{{data.form.accountingStandards != 2000020008}}',
                                            children: [{
                                                name: 'mode0',
                                                component: '::div',
                                                className: 'mode',
                                                children: '支持下方三种方式：'
                                            }, {
                                                name: 'mode1',
                                                component: '::div',
                                                className: 'mode',
                                                children: '1.导入友商产品科目余额表生成期初余额，目前已支持用友(T3、T+、好会计)、金蝶（精斗云、KIS）等软件厂家主流产品'
                                            }, {
                                                name: 'mode2',
                                                component: '::div',
                                                className: 'mode',
                                                children: [{
                                                    name: 'text1',
                                                    component: '::span',
                                                    children: '2.标准模板导入，'
                                                }, {
                                                    name: 'common',
                                                    component: 'Dropdown',
                                                    className: 'dropdown',
                                                    overlay: {
                                                        name: 'menu',
                                                        component: 'Menu',
                                                        onClick: '{{$leadInTemplate}}',
                                                        children: [{
                                                            name: 'amountFormula',
                                                            component: 'Menu.Item',
                                                            key: '0',
                                                            children: '金额式'
                                                        }, {
                                                            name: 'quantyAmountFormula',
                                                            component: 'Menu.Item',
                                                            key: '1',
                                                            children: '数量金额式'
                                                        },
                                                        {
                                                            name: 'quantyCurrencyFormula',
                                                            component: 'Menu.Item',
                                                            key: '2',
                                                            children: '数量外币式'
                                                        },{
                                                            name: 'multiPageQuantyAmountFormula',
                                                            component: 'Menu.Item',
                                                            key: '3',
                                                            children: '多页签数量金额式'
                                                        }
                                                    ]
                                                    },
                                                    children: {
                                                        name: 'internal',
                                                        component: 'Button',
                                                        type: 'primary',
                                                        children: ['下载标准模板', {
                                                            name: 'down',
                                                            component: 'Icon',
                                                            fontFamily: 'edficon',
                                                            type: 'xia',
                                                            className: 'downicon'
                                                        }]
                                                    }
                                                }, {
                                                    name: 'text3',
                                                    component: '::span',
                                                    children: ' ，完善期初数据后将文件导入生成期初余额'
                                                }]

                                            },
                                            {
                                                name: 'mode3',
                                                component: '::div',
                                                className: 'mode',
                                                children: [{
                                                    name: 'text1',
                                                    component: '::span',
                                                    children: '3.在科目期初页面直接'
                                                }, {
                                                    name: 'text2',
                                                    component: 'Button',
                                                    className: 'handwork',
                                                    children: ' 手工录入期初余额 ',
                                                    onClick: '{{function(){$handwork()}}}'
                                                }, {
                                                    name: 'text3',
                                                    component: '::span',
                                                    children: '完成初始化'
                                                }
                                                ]

                                            }]
                                        }
                                    ]
                                }
                            }, {
                                name: 'item',
                                component: '::div',
                                className: 'ttk-gl-app-financeinit-uploaddata-body-content-middle-item',
                                children: [
                                    {
                                        name: 'itemContainer',
                                        component: '::div',
                                        _visible: '{{ data.other.checkedResult ? false : true}}',
                                        className: 'itemContainer',
                                        children: [
                                            {
                                                name: 'nodata',
                                                className: 'img',
                                                component: '::img',
                                                src: './vendor/img/gl/noFile.png'
                                            }, {
                                                name: 'nodata',
                                                component: '::div',
                                                className: 'fileText',
                                                children: '上传反馈信息'
                                            }
                                        ]
                                    }, {
                                        name: 'checkedResult',
                                        component: '::div',
                                        className: 'checkedResult',
                                        _visible: '{{ data.other.checkedResult ? true : false}}',
                                        children: [
                                            {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: 'chenggongtishi',
                                                        fontFamily: 'edficon',
                                                        className: 'checkedResult-checkedItem-icon'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("excelType", data.other.checkedResult ? data.other.checkedResult.excelType : undefined) }}'
                                                    }
                                                ]
                                            }, {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: '{{ data.other.checkedResult && data.other.checkedResult.checkTaxpayer == 0 ? "jinggao" : "chenggongtishi" }}',
                                                        fontFamily: 'edficon',
                                                        className: '{{ data.other.checkedResult && data.other.checkedResult.checkTaxpayer == 0 ? "checkedResult-checkedItem-icon-jinggao" : "checkedResult-checkedItem-icon" }}'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("checkTaxpayer", data.other.checkedResult ? data.other.checkedResult.checkTaxpayer : undefined) }}'
                                                    }
                                                ]
                                            }, {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: '{{ data.other.checkedResult && data.other.checkedResult.accountStandard == -1 ? "jinggao" : "chenggongtishi" }}',
                                                        fontFamily: 'edficon',
                                                        className: '{{ data.other.checkedResult && data.other.checkedResult.accountStandard == -1 ? "checkedResult-checkedItem-icon-jinggao" : "checkedResult-checkedItem-icon" }}'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("accountStandard", data.other.checkedResult ? data.other.checkedResult.accountStandard : undefined) }}'
                                                    }
                                                ]
                                            }, {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: '{{ data.other.checkedResult && data.other.checkedResult.checkExistDataInExcel == "导入余额表内无数据" ? "cuowutishi" : "chenggongtishi" }}',
                                                        fontFamily: 'edficon',
                                                        className: '{{ data.other.checkedResult && data.other.checkedResult.checkExistDataInExcel == "导入余额表内无数据" ? "checkedResult-checkedItem-icon-cuowutishi" : "checkedResult-checkedItem-icon" }}'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("checkExistDataInExcel", data.other.checkedResult ? data.other.checkedResult.checkExistDataInExcel : undefined) }}'
                                                    }
                                                ]
                                            }, {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: '{{ data.other.checkedResult && data.other.checkedResult.checkSameCodeOrName.length > 0 ? "cuowutishi" : "chenggongtishi" }}',
                                                        fontFamily: 'edficon',
                                                        className: '{{ data.other.checkedResult && data.other.checkedResult.checkSameCodeOrName.length > 0 ? "checkedResult-checkedItem-icon-cuowutishi" : data.other.checkedResult &&data.other.checkedResult.checkSameName.length > 0?"checkedResult-checkedItem-icon-jinggao" :"checkedResult-checkedItem-icon"}}'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("checkSameCodeOrName", data.other.checkedResult ? data.other.checkedResult.checkSameCodeOrName : undefined, data.other.checkedResult ? data.other.checkedResult.checkSameName : undefined) }}'
                                                    }
                                                ]
                                            }, {
                                                name: 'checkedItem',
                                                component: '::div',
                                                className: 'checkedResult-checkedItem',
                                                children: [
                                                    {
                                                        name: 'icon',
                                                        component: 'Icon',
                                                        type: '{{ data.other.checkedResult && data.other.checkedResult.checkDataFormat.length > 0 ? "cuowutishi" : "chenggongtishi" }}',
                                                        fontFamily: 'edficon',
                                                        className: '{{ data.other.checkedResult && data.other.checkedResult.checkDataFormat.length > 0 ? "checkedResult-checkedItem-icon-cuowutishi" : "checkedResult-checkedItem-icon" }}'
                                                    }, {
                                                        name: 'templateType',
                                                        component: '::div',
                                                        className: 'checkedResult-checkedItem-content',
                                                        children: '{{ $getCheckedResultContent("checkDataFormat", data.other.checkedResult ? data.other.checkedResult.checkDataFormat : undefined) }}'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
                },
                    //  {
                    //     name:'content2',
                    //     component:'::div',
                    //     className:'ttk-gl-app-financeinit-uploaddata-body-tips',
                    //     children:[
                    //         {
                    //             name:'title',
                    //             component:'::div',
                    //             className:'title',
                    //             children:'初始化方式:'
                    //         },
                    //         {
                    //             name:'sub',
                    //             component:'::div',
                    //             className:'uploadTip',
                    //             children:[
                    //                 {
                    //                     name: 't1',
                    //                     component: '::div',
                    //                     className:'tipItem',
                    //                     children: [
                    //                       {
                    //                         name: 't1icon',
                    //                         component: 'Icon',
                    //                         fontFamily: 'edficon',
                    //                         type: 'dian'
                    //                       },{
                    //                           name:'item1',
                    //                           component:'::div',
                    //                           className:'tipItem',
                    //                           children:'导入原账套科目余额表，生成期初科目余额。支持用友T3、T+、好会计、精斗云、KIS'
                    //                       }
                    //                     ]
                    //                 },{
                    //                     name:'item3',
                    //                     component:'::div',
                    //                     className:'tipItem',
                    //                     children:[
                    //                         {
                    //                             name: 't1',
                    //                             component: '::div',
                    //                             children: [
                    //                               {
                    //                                 name: 't1icon',
                    //                                 component: 'Icon',
                    //                                 fontFamily: 'edficon',
                    //                                 type: 'dian'
                    //                               },{
                    //                                   name:'text1',
                    //                                   component:'::span',
                    //                                   children:'模板导入，'
                    //                               }
                    //                             ]
                    //                         },{
                    //                             name:'text2',
                    //                             component:'::a',
                    //                             children:'下载模板' ,
                    //                             onClick: '{{$leadInTemplate}}'
                    //                         },
                    //                         {
                    //                             name:'text3',
                    //                             component:'::span',
                    //                             children:'后，在excel内编辑数据完成后，直接导入表格，生成期初科目余额完成初始化'
                    //                         }
                    //                     ]
                    //                 },{
                    //                     name:'item2',
                    //                     component:'::div',
                    //                     className:'tipItem',
                    //                     children: [
                    //                         {
                    //                             name: 't1',
                    //                             component: '::div',
                    //                             children: [
                    //                               {
                    //                                 name: 't1icon',
                    //                                 component: 'Icon',
                    //                                 fontFamily: 'edficon',
                    //                                 type: 'dian'
                    //                               },{
                    //                                   name:'text1',
                    //                                   component:'::span',
                    //                                   children:'发生科目较少时，您可以选择在科目期初页面'
                    //                               }
                    //                             ]
                    //                         },{
                    //                             name:'text2',
                    //                             component:'::a',
                    //                             children:'手工录入',
                    //                             onClick:'{{function(){$handwork()}}}'
                    //                         },
                    //                         {
                    //                             name:'text3',
                    //                             component:'::span',
                    //                             children:'完成初始化'
                    //                         }
                    //                     ]
                    //                 }
                    //             ]
                    //         }
                    //     ]
                    //  }
                ]
            }, {
                name: 'btn',
                component: '::div',
                className: 'ttk-gl-app-financeinit-uploaddata-footer',
                children: {
                    component: 'Button',
                    children: '下一步',
                    type: '{{data.other.nextStepBtnType}}',
                    disabled: '{{data.other.isCanNotToNextStep}}',
                    onClick: '{{$nextStep}}'
                }
            }]
        }
    }

}

export function getInitState(option) {
    return {
        data: {
            form: {
                periodDate: '',
                taxpayer: '',
                vatTaxpayer: '',
                vatTaxpayerEnum: [],
                accountingStandardsEnum: [],
                templateType: undefined,
                templateData: option.accountingStandards == 2000020008?[{ name: '标准模板', key: 0 }]:[{ name: 'T3 / U8', key: 1 }, { name: 'T+ / T6', key: 2 }, { name: '好会计', key: 3 }, { name: '精斗云 / 云代账 / 代账云', key: 4 }, { name: 'Kis', key: 5 },
                { name: 'K/3WISE', key: 18 },{ name: '金财代账', key: 12 }, { name: '云帐房', key: 14 }, { name: '慧算账', key: 15 }, { name: '其它', key: 13 }, { name: '标准模板', key: 0 }
                ]
            },
            other: {
                disabled: true,
                isEdit: false,
                isUploaded: false,
                isCanNotToNextStep: true,
                nextStepBtnType: ''
            },
            file: '',
            downloadTempShow: false
        }
    }
}
