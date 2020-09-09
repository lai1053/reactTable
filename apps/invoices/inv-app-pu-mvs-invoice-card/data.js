import moment from "moment";

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-pu-mvs-invoice-card',
        children: [{
            name: 'spin',
            component: 'Spin',
            tip: '加载中',
            spinning: '{{data.loading}}',
            delay: 0.01,
            children: [{
                    name: 'head',
                    component: '::div',
                    className: 'inv-app-pu-mvs-invoice-card-header',
                    children: [
                        // {
                        //     name: 'type-action1',
                        //     component: 'Radio.Group',
                        //     className: 'radio-group',
                        //     children: '{{data.form.sf01==="Y"?"专用发票":"普通发票"}}',
                        //     _visible: '{{$isReadOnly()}}',
                        // },
                        // {
                        //     name: 'type-action2',
                        //     component: 'Radio.Group',
                        //     className: 'radio-group',
                        //     value: '{{data.form.sf01}}',
                        //     disabled: '{{$notAllowEdit()}}',
                        //     onChange: '{{function(e){$typeActionChange(e.target.value)}}}',
                        //     _visible: '{{!$isReadOnly()}}',
                        //     children: [{
                        //         name: 'item1-ta',
                        //         component: 'Radio',
                        //         value: 'Y',
                        //         children: '专用发票',
                        //         className: 'radio'
                        //     }, {
                        //         name: 'item2-ta',
                        //         component: 'Radio',
                        //         value: 'N',
                        //         children: '普通发票',
                        //         className: 'radio'
                        //     }]
                        // },
                        {
                            name: 'title',
                            component: '::div',
                            className: 'inv-app-pu-mvs-invoice-card-header-title',
                            children: '机动车销售统一发票'
                        },
                        {
                            name: 'form',
                            component: '::div',
                            className: ' inv-app-pu-mvs-invoice-card-header-form',
                            children: [{
                                    name: 'item1',
                                    component: '::div',
                                    className: ' inv-app-pu-mvs-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-mvs-invoice-card-header-form-item-label ":"inv-app-pu-mvs-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.fpdm}}',
                                                visible: '{{data.error.fpdm&&data.error.fpdm.indexOf("不能为空")===-1}}',
                                                children: '发票代码：'
                                            },
                                            //children: '发票代码：'
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            maxLength: 12,
                                            value: '{{data.form.fpdm}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fpdm",e,true)}}}',
                                            className: '{{data.error.fpdm?"inv-app-pu-vats-invoice-card-header-form-item-value has-error":"inv-app-pu-vats-invoice-card-header-form-item-value"}}',
                                        }
                                    ]
                                },
                                {
                                    name: 'item2',
                                    component: '::div',
                                    className: ' inv-app-pu-mvs-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-mvs-invoice-card-header-form-item-label":"inv-app-pu-mvs-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            children: {
                                                name: 'tooltip',
                                                component: 'Tooltip',
                                                placement: 'left',
                                                getPopupContainer: '{{$handleGetPopupContainer}}',
                                                overlayClassName: 'has-error-tooltip',
                                                title: '{{data.error.fphm}}',
                                                visible: '{{data.error.fphm&&data.error.fphm.indexOf("不能为空")===-1}}',
                                                children: '发票号码：'
                                            },
                                            //  children: '发票号码：'
                                        },
                                        {

                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            maxLength: 8,
                                            value: '{{data.form.fphm}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fphm",e,true)}}}',
                                            className: '{{data.error.fphm?"inv-app-pu-vats-invoice-card-header-form-item-value has-error":"inv-app-pu-vats-invoice-card-header-form-item-value"}}',

                                        }
                                    ]
                                },
                                {
                                    name: 'item3',
                                    component: '::div',
                                    className: ' inv-app-pu-mvs-invoice-card-header-form-item',
                                    children: [{
                                            name: 'label',
                                            component: '::div',
                                            className: '{{$isReadOnly()?"inv-app-pu-mvs-invoice-card-header-form-item-label":"inv-app-pu-mvs-invoice-card-header-form-item-label ant-form-item-required"}}',
                                            // children: {
                                            //  name: 'tooltip',
                                            //  component: 'Tooltip',
                                            //  placement: 'left',
                                            //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                            //  overlayClassName: 'has-error-tooltip',
                                            //  title: '{{data.error.kprq}}',
                                            //  visible: '{{data.error.kprq}}',
                                            //  children: '开票日期：'
                                            // },
                                            children: '开票日期：'
                                        },
                                        {
                                            name: 'value',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"DatePicker"}}',
                                            defaultPickerValue: '{{data.other.defaultPickerValue}}',
                                            disabledDate: '{{$disabledDateQ}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            placeholder: '',
                                            value: '{{$isReadOnly()?(data.form.kprq?data.form.kprq.format("YYYY-MM-DD"):""):data.form.kprq}}',
                                            onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.kprq",date,true)}}}',
                                            className: '{{data.error.kprq?"inv-app-pu-vats-invoice-card-header-form-item-value has-error":"inv-app-pu-vats-invoice-card-header-form-item-value"}}',
                                        },
                                    ]
                                },
                            ]
                        }
                    ]
                },
                {
                    name: 'inv-app-pu-mvs-invoice-card-grid',
                    className: 'inv-app-pu-mvs-invoice-card-grid',
                    component: '::div',
                    children: [{
                            name: 'row1',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row1',
                            children: [{
                                    name: 'row1-col1',
                                    component: 'Col',
                                    span: 24,
                                    className: 'invoice-card-grid-row1-col',
                                    children: [{
                                            name: 'row1-col1-row1',
                                            component: 'Row',
                                            className: 'head-row1',
                                            gutter: 0,
                                            children: [{
                                                    name: 'row1-col1-row1-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    className: 'invoice-card-grid-thead',
                                                    children: {
                                                        name: 'row1-col1-row1-col1-div',
                                                        component: '::div',
                                                        children: '机打代码'
                                                    }
                                                },
                                                {
                                                    name: 'row1-col1-row1-col2',
                                                    component: 'Col',
                                                    className: 'not-edit-row no-right-border',
                                                    span: 18,
                                                    children: {
                                                        name: 'row1-col1-row1-col2-div',
                                                        component: '::div',
                                                        children: '{{data.form.fpdm}}'
                                                    }
                                                },
                                            ]
                                        },
                                        {
                                            name: 'row1-col1-row2',
                                            component: 'Row',
                                            className: 'head-row1',
                                            gutter: 0,
                                            children: [{
                                                    name: 'row1-col1-row2-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    className: 'invoice-card-grid-thead',
                                                    children: {
                                                        name: 'row1-col1-row2-col1-div',
                                                        component: '::div',
                                                        children: '机打号码'
                                                    }
                                                },
                                                {
                                                    name: 'row1-col1-row2-col2',
                                                    component: 'Col',
                                                    className: 'not-edit-row no-right-border',
                                                    span: 18,
                                                    children: {
                                                        name: 'row1-col1-row2-col2-div',
                                                        component: '::div',
                                                        children: '{{data.form.fphm}}'
                                                    }
                                                },
                                            ]
                                        },
                                        {
                                            name: 'row1-col1-row3',
                                            className: 'head-row1',
                                            component: 'Row',
                                            gutter: 0,
                                            children: [{
                                                    name: 'row1-col1-row3-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    className: 'invoice-card-grid-thead',
                                                    children: {
                                                        name: 'row1-col1-row3-col1-div',
                                                        component: '::div',
                                                        children: '机器编码'
                                                    }
                                                },
                                                {
                                                    name: 'row1-col1-row3-col2',
                                                    component: 'Col',
                                                    className: 'no-right-border',
                                                    span: 18,
                                                    children: {
                                                        name: 'row1-col1-row3-col2-div',
                                                        component: '::div',
                                                        children: {
                                                            name: 'input',
                                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                            disabled: '{{$notAllowEdit()}}',
                                                            onChange: '{{function(e){$handleFieldChangeE("data.form.jqbh",e)}}}',
                                                            value: '{{data.form.jqbh}}'
                                                        }
                                                    }
                                                },
                                            ]
                                        },
                                        {
                                            name: 'row1-col1-row4',
                                            component: 'Row',
                                            className: 'head-row1',
                                            gutter: 0,
                                            children: [{
                                                    name: 'row1-col1-row4-col1',
                                                    component: 'Col',
                                                    span: 6,
                                                    className: 'invoice-card-grid-thead no-bottom-border',
                                                    children: {
                                                        name: 'row1-col1-row4-col1-div',
                                                        component: '::div',
                                                        children: '购方名称'
                                                    }
                                                },
                                                {
                                                    name: 'row1-col1-row4-col2',
                                                    component: 'Col',
                                                    span: 18,
                                                    className: 'not-edit-row no-bottom-border no-right-border',
                                                    children: {
                                                        name: 'row1-col1-row4-col2-div',
                                                        component: '::div',
                                                        children: '{{data.form.gfmc}}'
                                                    }
                                                },
                                            ]
                                        },
                                    ]
                                },
                             /*   {
                                    name: 'row1-col2',
                                    component: 'Col',
                                    span: 1,
                                    className: 'invoice-card-grid-row1-col',
                                    children: {
                                        name: 'row1-col2-col',
                                        component: '::div',
                                        className: 'vertical-row',
                                        children: '税 控 码'
                                    },
                                },
                                // {
                                //  name: 'row-col4',
                                //  component: 'Col',
                                //  span: 11,
                                //  children: {
                                //      name: 'row-col4-col',
                                //      component: '::div',
                                //      className: '{{data.error.sf12?"has-error":""}}',
                                //      children: {
                                //          name: 'textarea',
                                //          style: {
                                //              height: 94,
                                //              width: '99.9%'
                                //          },
                                //          component: 'Input.TextArea',
                                //          disabled: '{{$notAllowEdit()}}',
                                //          onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e)}}}',
                                //          value: '{{data.form.sf12}}'
                                //      }
                                //  }
                                // },
                                {
                                    name: 'row-col4',
                                    component: 'Col',
                                    className: 'row-col2',
                                    span: 11,
                                    children: [{
                                            name: 'row-col4-row1',
                                            component: 'Row',
                                            className: 'row-col2-row',
                                            children: {
                                                name: 'row-col4-row1-col',
                                                component: 'Col',
                                                span: 24,
                                                className: '{{data.error.sf12?"has-error":""}}',
                                                children: {
                                                    name: 'tooltip',
                                                    component: 'Tooltip',
                                                    placement: 'left',
                                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                                    overlayClassName: 'has-error-tooltip',
                                                    title: '{{data.error.sf12}}',
                                                    visible: '{{data.error.sf12}}',
                                                    children: {
                                                        name: 'input',
                                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                        disabled: '{{$notAllowEdit()}}',
                                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                        onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e,true)}}}',
                                                        value: '{{data.form.sf12}}'
                                                    }
                                                },
                                                // children: {
                                                //     name: 'input',
                                                //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                //     disabled: '{{$notAllowEdit()}}',
                                                //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf12",e,true)}}}',
                                                //     value: '{{data.form.sf12}}'
                                                // }
                                            }
                                        },
                                        {
                                            name: 'row-col4-row2',
                                            component: 'Row',
                                            className: 'row-col2-row',
                                            children: {
                                                name: 'row-col4-row2-col',
                                                component: 'Col',
                                                span: 24,
                                                className: '{{data.error.sf13?"has-error":""}}',
                                                children: {
                                                    name: 'tooltip',
                                                    component: 'Tooltip',
                                                    placement: 'left',
                                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                                    overlayClassName: 'has-error-tooltip',
                                                    title: '{{data.error.sf13}}',
                                                    visible: '{{data.error.sf13}}',
                                                    children: {
                                                        name: 'input',
                                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                        disabled: '{{$notAllowEdit()}}',
                                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                        onChange: '{{function(e){$handleFieldChangeE("data.form.sf13",e,true)}}}',
                                                        value: '{{data.form.sf13}}'
                                                    }
                                                },
                                                // children: {
                                                //     name: 'input',
                                                //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                //     disabled: '{{$notAllowEdit()}}',
                                                //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf13",e,true)}}}',
                                                //     value: '{{data.form.sf13}}'
                                                // }
                                            }
                                        },
                                        {
                                            name: 'row-col4-row3',
                                            component: 'Row',
                                            className: 'row-col2-row',
                                            children: {
                                                name: 'row-col4-row3-col',
                                                component: 'Col',
                                                span: 24,
                                                className: '{{data.error.sf14?"has-error":""}}',
                                                children: {
                                                    name: 'tooltip',
                                                    component: 'Tooltip',
                                                    placement: 'left',
                                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                                    overlayClassName: 'has-error-tooltip',
                                                    title: '{{data.error.sf14}}',
                                                    visible: '{{data.error.sf14}}',
                                                    children: {
                                                        name: 'input',
                                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                        disabled: '{{$notAllowEdit()}}',
                                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                        onChange: '{{function(e){$handleFieldChangeE("data.form.sf14",e,true)}}}',
                                                        value: '{{data.form.sf14}}'
                                                    }
                                                },
                                                // children: {
                                                //     name: 'input',
                                                //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                //     disabled: '{{$notAllowEdit()}}',
                                                //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf14",e,true)}}}',
                                                //     value: '{{data.form.sf14}}'
                                                // }
                                            }
                                        },
                                        {
                                            name: 'row-col4-row4',
                                            component: 'Row',
                                            className: 'row-col2-row',
                                            children: {
                                                name: 'row-col4-row4-col',
                                                component: 'Col',
                                                span: 24,
                                                className: '{{data.error.sf15?"no-bottom-border has-error":"no-bottom-border"}}',
                                                children: {
                                                    name: 'tooltip',
                                                    component: 'Tooltip',
                                                    placement: 'left',
                                                    getPopupContainer: '{{$handleGetPopupContainer}}',
                                                    overlayClassName: 'has-error-tooltip',
                                                    title: '{{data.error.sf15}}',
                                                    visible: '{{data.error.sf15}}',
                                                    children: {
                                                        name: 'input',
                                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                        disabled: '{{$notAllowEdit()}}',
                                                        onKeyUp:"{{function(e){return e.target.value=e.target.value.replace(/[\u4e00-\u9fa5]/g,'')}}}",
                                                        onChange: '{{function(e){$handleFieldChangeE("data.form.sf15",e,true)}}}',
                                                        value: '{{data.form.sf15}}'
                                                    }
                                                },
                                                // children: {
                                                //     name: 'input',
                                                //     component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                //     disabled: '{{$notAllowEdit()}}',
                                                //     onChange: '{{function(e){$handleFieldChangeE("data.form.sf15",e,true)}}}',
                                                //     value: '{{data.form.sf15}}'
                                                // }
                                            }
                                        },
                                    ]
                                },*/
                            ]
                        },
                        {
                            name: 'row2',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row2-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row2-col1-div',
                                        component: '::div',
                                        children: '身份证/机构码'
                                    }
                                },
                                {
                                    name: 'row2-col2',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row2-col2-div',
                                        component: '::div',
                                        children: '{{data.form.gfsbh}}'
                                    }
                                },
                                {
                                    name: 'row2-col3',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row2-col3-div',
                                        component: '::div',
                                        children: '购方识别号'
                                    }
                                },
                                {
                                    name: 'row2-col4',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row2-col4-div',
                                        component: '::div',
                                        children: '{{data.form.gfsbh}}'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'row3',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row3-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row3-col1-div',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                        children: '车辆类型'
                                    }
                                },
                                {
                                    name: 'row3-col2',
                                    component: 'Col',
                                    span: 6,
                                    children: {
                                        name: 'row3-col2-div',
                                        component: '::div',
                                        className: '{{data.error.cllx?"has-error":""}}',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.cllx}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.cllx",e,true)}}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row3-col3',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row3-col3-div',
                                        component: '::div',
                                        children: '厂牌型号'
                                    }
                                },
                                {
                                    name: 'row3-col4',
                                    component: 'Col',
                                    span: 4,
                                    children: {
                                        name: 'row3-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.cpxh}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.cpxh",e)}}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row3-col5',
                                    component: 'Col',
                                    span: 2,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row3-col5-div',
                                        component: '::div',
                                        children: '产地'
                                    }
                                },
                                {
                                    name: 'row3-col6',
                                    component: 'Col',
                                    span: 6,
                                    children: {
                                        name: 'row3-col6-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.cd}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.cd",e)}}}'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            name: 'row4',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row4-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row4-col1-div',
                                        component: '::div',
                                        children: '合格证号'
                                    }
                                },
                                {
                                    name: 'row4-col2',
                                    component: 'Col',
                                    span: 6,
                                    children: {
                                        name: 'row4-col2-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.hgzs}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.hgzs",e)}}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row4-col3',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row4-col3-div',
                                        component: '::div',
                                        children: '进口证期书号'
                                    }
                                },
                                {
                                    name: 'row4-col4',
                                    component: 'Col',
                                    span: 4,
                                    children: {
                                        name: 'row4-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.jkzmsh}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.jkzmsh",e)}}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row4-col5',
                                    component: 'Col',
                                    span: 2,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row4-col5-div',
                                        component: '::div',
                                        children: '商检单号'
                                    }
                                },
                                {
                                    name: 'row4-col6',
                                    component: 'Col',
                                    span: 6,
                                    children: {
                                        name: 'row4-col6-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.sjdh}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.sjdh",e)}}}'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            name: 'row5',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row5-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row5-col1-div',
                                        component: '::div',
                                        children: '发动机号码'
                                    }
                                },
                                {
                                    name: 'row5-col2',
                                    component: 'Col',
                                    span: 9,
                                    children: {
                                        name: 'row5-col2-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.fdjhm}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.fdjhm",e)}}}'
                                        }

                                    }
                                },
                                {
                                    name: 'row5-col3',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row5-col3-div',
                                        component: '::div',
                                        children: '车辆识别代号/车架号码'
                                    }
                                },
                                {
                                    name: 'row5-col4',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row5-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            value: '{{data.form.cjhm}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.cjhm",e)}}}'
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row6',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row6-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row6-col1-div',
                                        component: '::div',
                                        children: '价税合计(大写)'
                                    }
                                },
                                {
                                    name: 'row6-col2',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 9,
                                    children: {
                                        name: 'row6-col2-div',
                                        component: '::div',
                                        children: '{{data.form.jshjDx}}'
                                    }
                                },
                                {
                                    name: 'row6-col3',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    // children: {
                                    //  name: 'tooltip',
                                    //  component: 'Tooltip',
                                    //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                    //  placement: 'left',
                                    //  overlayClassName: 'has-error-tooltip',
                                    //  title: '{{data.error.jshj}}',
                                    //  visible: '{{data.error.jshj}}',
                                    //  children: {
                                    //      name: 'row6-col3-div',
                                    //      component: '::div',
                                    //      {{"className: $isReadOnly()?'":"className: 'ant-form-item-required"}}',
                                    //      children: '价税合计(小写)'
                                    //  },
                                    // },
                                    children: {
                                        name: 'row6-col3-div',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                        children: '价税合计(小写)'
                                    },
                                },
                                {
                                    name: 'row6-col4',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row6-col4-div',
                                        component: '::div',
                                        className: '{{data.error.jshj?"has-error":""}}',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                            executeBlur: true,
                                            onBlur: '{{$handleCellNumberBlur("data.form.jshj")}}',
                                            precision: 2,
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{$amountChange}}',
                                            value: '{{data.form.jshj}}',
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row7',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row7-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row7-col1-div',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                        children: '销方名称'
                                    }
                                },
                                {
                                    name: 'row7-col2',
                                    component: 'Col',
                                    span: 9,
                                    // children: {
                                    //  name: 'tooltip',
                                    //  component: 'Tooltip',
                                    //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                    //  placement: 'right',
                                    //  overlayClassName: 'has-error-tooltip',
                                    //  title: '{{data.error.xfmc}}',
                                    //  visible: '{{data.error.xfmc}}',
                                    //  children: {
                                    //      name: 'row7-col2-div',
                                    //      component: '::div',
                                    //      children: {
                                    //          name: 'input',
                                    //          component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    //          disabled: '{{$notAllowEdit()}}',
                                    //          onChange: '{{function(e){$handleFieldChangeE("data.form.xfmc",e,true)}}}',
                                    //          value: '{{data.form.xfmc}}'
                                    //      }
                                    //  }
                                    // },
                                    children: {
                                        name: 'row7-col2-div',
                                        component: '::div',
                                        className: '{{data.error.xfmc?"has-error":""}}',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfmc",e,true)}}}',
                                            value: '{{data.form.xfmc}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row7-col3',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row7-col3-div',
                                        component: '::div',
                                        children: '销方电话'
                                    }
                                },
                                {
                                    name: 'row7-col4',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row7-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.sf05",e)}}}',
                                            value: '{{data.form.sf05}}'
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row8',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row8-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row8-col1-div',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                        children: '销方识别号'
                                    }
                                },
                                {
                                    name: 'row8-col2',
                                    component: 'Col',
                                    span: 9,
                                    className: '{{data.error.xfsbh?"has-error":""}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'right',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.xfsbh}}',
                                        visible: '{{data.error.xfsbh&&data.error.xfsbh.indexOf("不能为空")===-1}}',
                                        children: {
                                            name: 'row8-col2-div',
                                            component: '::div',
                                            children: {
                                                name: 'input',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                                disabled: '{{$notAllowEdit()}}',
                                                onChange: '{{function(e){$handleFieldChangeE("data.form.xfsbh",e,true)}}}',
                                                value: '{{data.form.xfsbh}}'
                                            }
                                        }
                                    },
                                    // children: {
                                    //  name: 'row8-col2-div',
                                    //  component: '::div',
                                    //  className: '{{data.error.xfsbh?"has-error":""}}',
                                    //  children: {
                                    //      name: 'input',
                                    //      component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                    //      disabled: '{{$notAllowEdit()}}',
                                    //      onChange: '{{function(e){$handleFieldChangeE("data.form.xfsbh",e,true)}}}',
                                    //      value: '{{data.form.xfsbh}}'
                                    //  }
                                    // }
                                },
                                {
                                    name: 'row8-col3',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row8-col3-div',
                                        component: '::div',
                                        children: '销方账号'
                                    }
                                },
                                {
                                    name: 'row8-col4',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row8-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.sf06",e)}}}',
                                            value: '{{data.form.sf06}}'
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row9',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row9-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row9-col1-div',
                                        component: '::div',
                                        children: '销方地址'
                                    }
                                },
                                {
                                    name: 'row9-col2',
                                    component: 'Col',
                                    span: 9,
                                    children: {
                                        name: 'row9-col2-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfdzdh",e)}}}',
                                            value: '{{data.form.xfdzdh}}'
                                        }

                                    }
                                },
                                {
                                    name: 'row9-col3',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row9-col3-div',
                                        component: '::div',
                                        children: '销方开户银行'
                                    }
                                },
                                {
                                    name: 'row9-col4',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row9-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.xfyhzh",e)}}}',
                                            value: '{{data.form.xfyhzh}}'
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row10',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row10-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row10-col1-div',
                                        component: '::div',
                                        className: '{{$isReadOnly()?"":"ant-form-item-required"}}',
                                        children: '税率'
                                    }
                                },
                                {
                                    name: 'row10-col2',
                                    component: 'Col',
                                    span: 3,
                                    // children: {
                                    //  name: 'tooltip',
                                    //  component: 'Tooltip',
                                    //  getPopupContainer: '{{$handleGetPopupContainer}}',
                                    //  placement: 'right',
                                    //  overlayClassName: 'has-error-tooltip',
                                    //  title: '{{data.error.zbslv}}',
                                    //  visible: '{{data.error.zbslv}}',
                                    //  children: {
                                    //      name: 'row10-col2-div',
                                    //      component: '::div',
                                    //      children: {
                                    //          name: 'select',
                                    //          component: 'Select',
                                    //          disabled: '{{$notAllowEdit()}}',
                                    //          children: '{{$renderSelectOption()}}',
                                    //          dropdownMatchSelectWidth: false,
                                    //          dropdownStyle: { width: '125px' },
                                    //          onChange: '{{$taxRateChange}}',
                                    //          value: '{{data.form.zbslv}}'
                                    //      }
                                    //  }
                                    // },
                                    children: {
                                        name: 'row10-col2-div',
                                        component: '::div',
                                        className: '{{data.error.zbslv?"has-error":""}}',
                                        children: {
                                            name: 'select',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                            showSearch: true,
                                            filterOption: '{{function(input, option){return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            children: '{{$renderSelectOption()}}',
                                            dropdownMatchSelectWidth: false,
                                            dropdownStyle: { width: '125px' },
                                            onChange: '{{$taxRateChange}}',
                                            value: '{{!$isReadOnly()?data.form.zbslv:(data.form.zbslv!==undefined&&(data.form.zbslv * 100 +"%")||"")}}',
                                        }
                                    }

                                },
                                {
                                    name: 'row10-col3',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row10-col3-div',
                                        component: '::div',
                                        children: '税额'
                                    }
                                },
                                {
                                    name: 'row10-col4',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 3,
                                    children: {
                                        name: 'row10-col4-div',
                                        component: '::div',
                                        children: '{{data.form.hjse}}'
                                    }
                                },
                                {
                                    name: 'row10-col5',
                                    component: 'Col',
                                    span: 4,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row10-col5-div',
                                        component: '::div',
                                        children: '税务机关代码'
                                    }
                                },
                                {
                                    name: 'row10-col6',
                                    component: 'Col',
                                    span: 8,
                                    children: {
                                        name: 'row10-col6-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.swjgDm",e)}}}',
                                            value: '{{data.form.swjgDm}}'
                                        }

                                    }
                                }
                            ]
                        },
                        {
                            name: 'row11',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row11-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row11-col1-div',
                                        component: '::div',
                                        children: '不含税价'
                                    }
                                },
                                {
                                    name: 'row11-col2',
                                    component: 'Col',
                                    className: 'not-edit-row',
                                    span: 6,
                                    children: {
                                        name: 'row11-col2-div',
                                        component: '::div',
                                        children: '{{data.form.hjje}}'
                                    }
                                },
                                {
                                    name: 'row11-col3',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row11-col3-div',
                                        component: '::div',
                                        children: '完税凭证号码'
                                    }
                                },
                                {
                                    name: 'row11-col4',
                                    component: 'Col',
                                    span: 4,
                                    children: {
                                        name: 'row11-col4-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.wspzhm",e)}}}',
                                            value: '{{data.form.wspzhm}}',

                                        }

                                    }
                                },
                                {
                                    name: 'row11-col5',
                                    component: 'Col',
                                    span: 2,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row11-col5-div',
                                        component: '::div',
                                        children: '吨位'
                                    }
                                },
                                {
                                    name: 'row11-col6',
                                    component: 'Col',
                                    span: 2,
                                    children: {
                                        name: 'row11-col6-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                            executeBlur: true,
                                            precision: 2,
                                            onBlur: '{{$handleCellNumberBlur("data.form.sf07")}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(v){$handleFieldChangeV("data.form.sf07",v)}}}',
                                            value: '{{data.form.sf07}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row11-col7',
                                    component: 'Col',
                                    span: 2,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row11-col7-div',
                                        component: '::div',
                                        children: '限乘人数'
                                    }
                                },
                                {
                                    name: 'row11-col8',
                                    component: 'Col',
                                    span: 2,
                                    children: {
                                        name: 'row11-col8-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                            minValue: 0,
                                            executeBlur: true,
                                            onBlur: '{{$handleCellNumberBlur("data.form.xcrs")}}',
                                            precision: 0,
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(v){$handleFieldChangeV("data.form.xcrs",v)}}}',
                                            value: '{{data.form.xcrs}}'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            name: 'row13',
                            component: 'Row',
                            gutter: 0,
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row13-col1',
                                    component: 'Col',
                                    span: 3,
                                    className: 'invoice-card-grid-thead',
                                    children: {
                                        name: 'row13-col1-div',
                                        component: '::div',
                                        children: '备注'
                                    }
                                },
                                {
                                    name: 'row13-col2',
                                    component: 'Col',
                                    span: 15,
                                    children: {
                                        name: 'row13-col2-div',
                                        component: '::div',
                                        children: {
                                            name: 'input',
                                            component: '{{$isReadOnly()?"DataGrid.TextCell":"Input"}}',
                                            className: '{{$isReadOnly()?"-mx-cell":""}}',
                                            disabled: '{{$notAllowEdit()}}',
                                            onChange: '{{function(e){$handleFieldChangeE("data.form.bz",e,true)}}}',
                                            value: '{{data.form.bz}}'
                                        }
                                    }
                                },
                                {
                                    name: 'row2-col2-3',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: 3,
                                    //_visible: '{{$notXaoGuiMo()}}',
                                    children: {
                                        name: 'row2-col2-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt==1?'':''}}",
                                        children: '即征即退',
                                    }
                                },
                                {
                                    name: 'row2-col2-3',
                                    component: 'Col',
                                    className: '',
                                    span: 3,
                                    //_visible: '{{$notXaoGuiMo()}}',
                                    children:{
                                        name:'select',
                                        component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                        placeholder:'否',
                                        className:'ticket-app-filter-popover-body-content-item-select',
                                        onChange:"{{function(val){$sf('data.form.mxDetailList[0].jzjtDm',val)}}}",
                                        value: '{{$isReadOnly()?data.form.mxDetailList[0].jzjtDm ==="Y"?"是":"否" :data.form.mxDetailList[0].jzjtDm}}',
                                        getPopupContainer: '{{function(trigger){return trigger.parentNode}}}',
                                        children:{
                                            name:'option',
                                            component: 'Select.Option',
                                            children:'{{data.jzjtDmList[_rowIndex].value}}',
                                            value:'{{String(data.jzjtDmList[_rowIndex].jzjtDm)}}',
                                            _power:'for in data.jzjtDmList',
                                        }
                                    }
                                 
                                }
                            ]
                        },
                        {
                            name: 'row15',
                            component: 'Row',
                            _visible: '{{$notXaoGuiMo()}}',
                            className: 'invoice-card-grid-row',
                            children: [{
                                    name: 'row2-col1-1',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'row2-col1-div',
                                        component: '::div',
                                        children: '认证状态'
                                    }
                                },
                                {
                                    name: 'row2-col1-2',
                                    component: 'Col',
                                    span: '{{$isV2Component()?3:6}}',
                                    style: {
                                        textAlign: 'center'
                                    },
                                    children: {
                                        name: 'row2-col1-div',
                                        component: '::div',
                                        disabled: '{{$notAllowEditBdzt()}}',
                                        children: {
                                            name: 'status',
                                            component: '{{$isReadOnly()?"::span":"Checkbox"}}',
                                            //disabled: '{{$notAllowEditBdzt()}}',
                                            checked: '{{data.form.bdzt}}',
                                            onChange: '{{function(e){$handleBdztChangeC("data.form.bdzt",e)}}}',
                                            children: '{{$isReadOnly()&&!data.form.bdzt?"未认证":"已认证"}}'
                                        }
                                    }
                                }, {
                                    name: 'row2-col2-3',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'row2-col2-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt==1?'ant-form-item-required':''}}",
                                        children: '申报用途',
                                    }
                                },
                                {
                                    name: 'row2-col2-4',
                                    component: 'Col',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.bdlyLx}}',
                                        visible: '{{data.error.bdlyLx && data.error.bdlyLx.indexOf("不能为空")===-1}}',
                                        children: {
                                            className: '{{data.error.bdlyLx?"has-error":""}}',
                                            name: 'row2-col3-div',
                                            component: '::div',
                                            children: {
                                                name: 'status',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                                align: 'left',
                                                placeholder: '',
                                                value: '{{data.form.bdlyLx}}',
                                                disabled: '{{!data.form.bdzt}}', // 认证状态
                                                onChange: '{{function(val){$handleBdlylxChangeV(val)}}}',
                                                children: '{{$renderBdlyLX()}}'
                                            },
                                        }
                                    }
                                }, {
                                    name: 'row2-col3-5',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'row2-col3-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt && data.form.bdlyLx==1?'ant-form-item-required':''}}",
                                        children: '抵扣月份',
                                    }
                                },
                                {
                                    name: 'row2-col3-6',
                                    component: 'Col',
                                    span: '{{$isV2Component()?3:6}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.dkyf}}',
                                        visible: '{{data.error.dkyf && data.error.dkyf.indexOf("不能为空")===-1}}',
                                        children: {
                                            name: 'row2-col4-div',
                                            component: '::div',
                                            className: '{{data.error.dkyf?"has-error":""}}',
                                            children: {
                                                name: 'status',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Select"}}',
                                                align: 'left',
                                                placeholder: '',
                                                value: '{{data.form.dkyf}}',
                                                disabled: '{{$notAllowEditDkyf()}}',
                                                onChange: '{{function(date,dateString){$handleFieldChangeV("data.form.dkyf",date)}}}',
                                                children: '{{$renderDkyf()}}'
                                            },
                                        }
                                    }
                                }, {
                                    name: 'row2-col4-7',
                                    component: 'Col',
                                    className: 'invoice-card-grid-thead',
                                    _visible: '{{$isV2Component()}}',
                                    span: 3,
                                    children: {
                                        name: 'row2-col4-div',
                                        component: '::div',
                                        className: "{{data.form.fplyLx==2 && data.form.bdzt?'ant-form-item-required':''}}",
                                        children: '有效税额',
                                    }
                                },
                                {
                                    name: 'row2-col4-8',
                                    component: 'Col',
                                    span: 3,
                                    _visible: '{{$isV2Component()}}',
                                    children: {
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        getPopupContainer: '{{$handleGetPopupContainer}}',
                                        placement: 'left',
                                        overlayClassName: 'has-error-tooltip',
                                        title: '{{data.error.nf06}}',
                                        visible: '{{data.form.fplyLx == 2 && data.form.bdzt && data.error.nf06 && data.error.nf06.indexOf("不能为空")===-1}}',
                                        children: {
                                            name: 'row2-col4-div',
                                            component: '::div',
                                            className: '{{data.form.fplyLx == 2 && data.form.bdzt && data.error.nf06?"has-error":""}}',
                                            children: {
                                                name: 'nf06',
                                                component: '{{$isReadOnly()?"DataGrid.TextCell":"Input.Number"}}',
                                                executeBlur: true,
                                                onBlur: '{{$handleFormNumberBlur("nf06")}}',
                                                precision: 2,
                                                disabled: '{{$notAllowEditDkyf()}}',
                                                align: 'right',
                                                className: "{{$getCellClassName(_ctrlPath)}}",
                                                value: '{{$quantityFormat(data.form.nf06,2,$isFocus(_ctrlPath),true)}}',
                                                title: '{{$quantityFormat(data.form.nf06,2,false,true)}}',
                                                onChange: '{{function(val){$handleFieldChangeV("data.form.nf06",val)}}}',
                                            },
                                        }
                                    }
                                }

                            ]
                        }
                    ]
                }, {
                    name: 'kpr',
                    className: 'kpr',
                    component: '::div',
                    children: [{
                        name: 'kpr-txt',
                        className: 'kpr-txt',
                        component: '::span',
                        children: '开票人：'
                    }, {
                        name: 'kpr-input',
                        className: 'kpr-input',
                        disabled:'{{data.justShow}}',
                        component: 'Input',
                        value: '{{data.form.kpr}}',
                        onChange: '{{function(e){$sf("data.form.kpr",e.target.value)}}}'
                    }]
                }

            ]

        }],

    }
}

export function getInitState() {
    return {
        data: {
            justShow:false,
            loading: true,
            form: {
                sf01:'Y',
                mxDetailList:[
                    {jzjtDm:'N'}
                ]
            },
            jzjtDmList:[
                {
                    jzjtDm:'Y',
                    value:'是'
                },{
                    jzjtDm:'N',
                    value: '否'
                }
    
            ],
            error: {},
            other: {
                defaultPickerValue: null,
            }
        }
    }
}