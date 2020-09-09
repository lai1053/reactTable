export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-invoice-card',
        children: '{{$renderChildren()}}',
    }
}

function getMeta1() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-invoice-card',
        children: {
            name: 'spin',
            component: 'Spin',
            tip: '加载中...',
            delay: 0.01,
            spinning: '{{data.loading}}',
            children: [{
                name: 'header',
                component: '::div',
                className: 'inv-app-sales-invoice-card-header',
                children: [{
                    name: 'title',
                    component: '::h1',
                    className: 'title',
                    children: '{{data.title}}'
                }, {
                    name: 'right',
                    component: '::div',
                    className: 'right',
                    _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='03' || data.fpzlDm==='04'}}",
                    children: [{
                        name: 'row1',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 10,
                            children: '发票代码：'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            className: 'no-margin',
                            span: 14,
                            children: '{{data.form.fpdm}}',
                        }]
                    }, {
                        name: 'row2',
                        component: 'Row',
                        _visible: false,
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 10,
                            children: '发票号码：'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            className: 'no-margin',
                            span: 14,
                            children: '{{data.form.fphm}}',
                        }]
                    }, {
                        name: 'row3',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 10,
                            children: '开票日期：'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            className: 'no-margin',
                            span: 14,
                            children: '{{data.form.kprq}}',
                        }]
                    }],
                }]
            }, {
                name: 'buyer',
                component: 'Row',
                _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='04'}}",
                className: 'buyer',
                children: [{
                    name: 'col1',
                    component: 'Col',
                    className: 'v-rl',
                    span: 1,
                    children: '购买方'
                }, {
                    name: 'col2',
                    component: 'Col',
                    className: 'grid',
                    span: 12,
                    children: [{
                        name: 'row1',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '名称'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.gfmc}}',
                            children: '{{data.form.gfmc}}',
                        }],
                    }, {
                        name: 'row2',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '纳税人设别号'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.gfsbh}}',
                            children: '{{data.form.gfsbh}}',
                        }],
                    }, {
                        name: 'row3',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '地址、电话'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.gfdzdh}}',
                            children: '{{data.form.gfdzdh}}',
                        }],
                    }, {
                        name: 'row4',
                        component: 'Row',
                        children: [{
                            name: 'col11',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '开户行及账号'
                        }, {
                            name: 'col12',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.gfyhzh}}',
                            children: '{{data.form.gfyhzh}}',
                        }],
                    }],
                }, {
                    name: 'col3',
                    component: 'Col',
                    className: 'v-rl',
                    span: 1,
                    children: '密码区'
                }, {
                    name: 'col4',
                    component: 'Col',
                    className: 'grid',
                    span: 10,
                    children: [{
                        name: 'row1',
                        component: 'Row',
                        children: {
                            name: 'col1',
                            component: 'Col',
                            span: 24,
                            title: '{{data.form.sf12}}',
                            children: '{{data.form.sf12}}',
                        }
                    }, {
                        name: 'row2',
                        component: 'Row',
                        children: {
                            name: 'col1',
                            component: 'Col',
                            span: 24,
                            title: '{{data.form.sf13}}',
                            children: '{{data.form.sf13}}',
                        }
                    }, {
                        name: 'row3',
                        component: 'Row',
                        children: {
                            name: 'col1',
                            component: 'Col',
                            span: 24,
                            title: '{{data.form.sf14}}',
                            children: '{{data.form.sf14}}',
                        }
                    }, {
                        name: 'row4',
                        component: 'Row',
                        children: {
                            name: 'col1',
                            component: 'Col',
                            span: 24,
                            title: '{{data.form.sf15}}',
                            children: '{{data.form.sf15}}',
                        }
                    }],
                }]
            }, {
                name: 'details',
                component: 'DataGrid',
                _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='04'}}",
                className: 'inv-app-sales-invoice-card-details',
                headerHeight: 35,
                rowHeight: 24,
                rowsCount: '{{data.form.mxDetailList.length}}',
                key: '{{data.other.randomKey}}',
                readonly: true, //不允许增减行
                // enableSequence: true,
                enableAddDelrow: true,
                ellipsis: true,
                footerHeight: 24,
                sequenceFooter: {
                    name: 'footer',
                    component: 'DataGrid.Cell',
                },
                columns: [{
                        name: 'hwmc',
                        component: 'DataGrid.Column',
                        columnKey: 'hwmc',
                        width: 200 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '货物或应税劳务、服务名称'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            title: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                            children: '{{data.form.mxDetailList[_rowIndex].hwmc}}',
                            _power: '({rowIndex}) => rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'txt-right bg',
                            children: '合计'
                        },
                    },
                    {
                        name: 'ggxh',
                        component: 'DataGrid.Column',
                        columnKey: 'ggxh',
                        width: 100 * 0.9,
                        flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '规格型号'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            title: '{{data.form.mxDetailList[_rowIndex].ggxh}}',
                            children: '{{data.form.mxDetailList[_rowIndex].ggxh}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },
                    {
                        name: 'dw',
                        component: 'DataGrid.Column',
                        columnKey: 'dw',
                        width: 60 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '单位'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            title: '{{data.form.mxDetailList[_rowIndex].dw}}',
                            children: '{{data.form.mxDetailList[_rowIndex].dw}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },
                    {
                        name: 'sl',
                        component: 'DataGrid.Column',
                        columnKey: 'sl',
                        width: 60 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '数量'
                        },
                        cell: {
                            name: 'cell',
                            component: 'Row',
                            title: '{{data.form.mxDetailList[_rowIndex].sl}}',
                            children: '{{$numberFormat(data.form.mxDetailList[_rowIndex].sl,2,false,true)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },
                    {
                        name: 'dj',
                        component: 'DataGrid.Column',
                        columnKey: 'dj',
                        width: 80 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            children: '单价'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            align: 'right',
                            title: '{{data.form.mxDetailList[_rowIndex].dj}}',
                            children: '{{$numberFormat(data.form.mxDetailList[_rowIndex].dj,4,false,false)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },
                    {
                        name: 'je',
                        component: 'DataGrid.Column',
                        columnKey: 'je',
                        width: 120 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '金额'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            align: 'right',
                            title: '{{$numberFormat(data.form.mxDetailList[_rowIndex].je,2,false,false)}}',
                            children: '{{$numberFormat(data.form.mxDetailList[_rowIndex].je,2,false,false)}}',
                            _power: '({rowIndex}) => rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'txt-right',
                            title: '{{$amountTotal("je",false)}}',
                            children: '{{$amountTotal("je",false)}}',
                        },
                    },
                    {
                        name: 'slv',
                        component: 'DataGrid.Column',
                        columnKey: 'slv',
                        width: 70 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '税率'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            title: '{{$getListVal("slv",data.form.mxDetailList[_rowIndex].slv)}}',
                            children: '{{$getListVal("slv",data.form.mxDetailList[_rowIndex].slv)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    },
                    {
                        name: 'se',
                        component: 'DataGrid.Column',
                        columnKey: 'se',
                        width: 110 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '税额'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            align: 'right',
                            title: '{{$numberFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
                            children: '{{$numberFormat(data.form.mxDetailList[_rowIndex].se,2,false,false)}}',
                            _power: '({rowIndex}) => rowIndex',
                        },
                        footer: {
                            name: 'footer',
                            component: 'DataGrid.Cell',
                            className: 'txt-right',
                            title: '{{$amountTotal("se",false)}}',
                            children: '{{$amountTotal("se",false)}}',
                        },
                    }, {
                        name: 'hwlxDm',
                        component: 'DataGrid.Column',
                        columnKey: 'hwlxDm',
                        width: 100 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '货物类型'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            // title: '{{data.form.mxDetailList[_rowIndex].hwlxDm}}',
                            children: '{{$getListVal("hwlxDm",data.form.mxDetailList[_rowIndex].hwlxDm)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }, {
                        name: 'jsfsDm',
                        component: 'DataGrid.Column',
                        columnKey: 'jsfsDm',
                        width: 100 * 0.9,
                        // flexGrow: 1,
                        header: {
                            name: 'header',
                            component: 'DataGrid.Cell',
                            className: 'ant-form-item-center',
                            children: '计税方式'
                        },
                        cell: {
                            name: 'cell',
                            component: 'DataGrid.Cell',
                            // title: '{{data.form.mxDetailList[_rowIndex].jsfsDm}}',
                            children: '{{$getListVal("jsfsDm",data.form.mxDetailList[_rowIndex].jsfsDm)}}',
                            _power: '({rowIndex}) => rowIndex',
                        }
                    }
                ]
            }, {
                name: 'total1',
                component: '::div',
                _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='04'}}",
                className: 'total',
                children: [{
                    name: 'col1',
                    component: '::div',
                    className: 'col1 bg txt-right',
                    children: '价税合计(大写)',
                }, {
                    name: 'col2',
                    component: '::div',
                    className: 'col2',
                    title: '{{$moneyToBig(true)}}',
                    children: '{{$moneyToBig(true)}}',
                }, {
                    name: 'col3',
                    component: '::div',
                    className: 'col3 txt-right bg',
                    children: '价税合计(小写)',
                }, {
                    name: 'col4',
                    component: '::div',
                    className: 'col4 txt-right',
                    title: '{{$moneyToBig(false)}}',
                    children: '{{$moneyToBig(false)}}',
                }],
            }, {
                name: 'buyer',
                component: 'Row',
                _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='04'}}",
                className: 'buyer',
                children: [{
                    name: 'col1',
                    component: 'Col',
                    className: 'v-rl',
                    span: 1,
                    children: '销售方'
                }, {
                    name: 'col2',
                    component: 'Col',
                    className: 'grid',
                    span: 12,
                    children: [{
                        name: 'row1',
                        component: 'Row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '名称'
                        }, {
                            name: 'col1',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.xfmc}}',
                            children: '{{data.form.xfmc}}',
                        }],
                    }, {
                        name: 'row2',
                        component: 'Row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '纳税人设别号'
                        }, {
                            name: 'col1',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.xfsbh}}',
                            children: '{{data.form.xfsbh}}',
                        }],
                    }, {
                        name: 'row3',
                        component: 'Row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '地址、电话'
                        }, {
                            name: 'col1',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.xfdzdh}}',
                            children: '{{data.form.xfdzdh}}',
                        }],
                    }, {
                        name: 'row4',
                        component: 'Row',
                        children: [{
                            name: 'col1',
                            component: 'Col',
                            className: 'txt-right',
                            span: 7,
                            children: '开户行及账号'
                        }, {
                            name: 'col1',
                            component: 'Col',
                            span: 17,
                            title: '{{data.form.xfyhzh}}',
                            children: '{{data.form.xfyhzh}}',
                        }],
                    }],
                }, {
                    name: 'col3',
                    component: 'Col',
                    className: 'v-rl',
                    span: 1,
                    children: '备注'
                }, {
                    name: 'col4',
                    component: 'Col',
                    span: 10,
                    children: {
                        name: 'p',
                        component: '::div',
                        className: 'textarea-h4',
                        title: '{{data.form.bz}}',
                        children: '{{data.form.bz}}',
                    },
                }]
            }, {
                name: 'action',
                component: 'Row',
                className: 'action',
                _visible: "{{data.fpzlDm==='01' || data.fpzlDm==='04'}}",
                children: [{
                    name: 'col1',
                    component: 'Col',
                    span: 7,
                    className: 'ant-form-item-center bg',
                    children: '即征即退标识',
                }, {
                    name: 'col1',
                    component: 'Col',
                    span: 7,
                    className: 'ant-form-item-center',
                    children: '{{data.form.jzjtbz==="N"?"否":"是"}}',
                }, {
                    name: 'col1',
                    component: 'Col',
                    span: 5,
                    className: 'ant-form-item-center bg',
                    children: '作废标识',
                }, {
                    name: 'col1',
                    component: 'Col',
                    span: 5,
                    className: 'ant-form-item-center',
                    children: '{{data.form.fpztDm==="1"?"否":"是"}}',
                }]
            }]
        },
    }
}

export function getInitState() {
    return {
        data: {
            loading: false,
            hwlxList: [],
            slList: [],
            jsfsList: [],
            spbmList: [],
            form: {},
            initData: {},
            error: {
                mxDetailList: [{}, {}, {}, {}, {}],
            },
            other: {
                minCount: 3,
                randomKey: Math.random(),
            }
        }
    }
}