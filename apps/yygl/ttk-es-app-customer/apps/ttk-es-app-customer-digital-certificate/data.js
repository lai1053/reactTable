export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer-digital-certificate',
        children:[
            {
                name:"top",
                component:'::div',
                className:"ttk-es-app-customer-digital-certificate-top",
                children:[
                    {
                        name:"button",
                        component:'::div',
                        className:"{{data.activeNo==='1'?'ttk-es-app-customer-digital-certificate-top-button-active':'ttk-es-app-customer-digital-certificate-top-button'}}",
                        children:'提交申请',
                        onClick:'{{function(){$changeSelectedTab("1")}}}'
                    },
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        style: { fontSize: '16px' },
                        type: 'XDZxianghou'
                    },
                    {
                        name:"button",
                        component:'::div',
                        className:"{{data.activeNo==='2'?'ttk-es-app-customer-digital-certificate-top-button-active':'ttk-es-app-customer-digital-certificate-top-button'}}",
                        children:'打印委托书',
                        onClick:'{{function(){$changeSelectedTab("2")}}}'
                    },
                    {
                        name: 'icon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        style: { fontSize: '16px' },
                        type: 'XDZxianghou'
                    },
                    {
                        name:"button",
                        component:'::div',
                        className:"{{data.activeNo==='3'?'ttk-es-app-customer-digital-certificate-top-button-active':'ttk-es-app-customer-digital-certificate-top-button'}}",
                        children:'盖章、邮寄',
                        onClick:'{{function(){$changeSelectedTab("3")}}}'
                    }
                ]
            },
            {
                name:"main",
                component:'::div',
                className:"ttk-es-app-customer-digital-certificate-main",
                children:[
                    {
                        name:"first",
                        component:'::div',
                        _visible:'{{data.activeNo==="1"}}',
                        className:"ttk-es-app-customer-digital-certificate-main-first",
                        children:[
                            {
                                name:"top",
                                component:'::div',
                                className:"ttk-es-app-customer-digital-certificate-main-first-top",
                                children:[
                                    {
                                        name:"left",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-first-top-left",
                                        children:[
                                            {
                                                name: 'tree',
                                                component: '::span',
                                                style: {
                                                    verticalAlign: 'middle',
                                                    marginRight: '8px'
                                                },
                                                children: '{{$renderTree()}}'
                                            },
                                            {
                                                name: 'header-filter-input',
                                                component: 'Input',
                                                className: 'ttk-es-app-customer-digital-certificate-main-first-top-left-input',
                                                type: 'text',
                                                placeholder: '请输入客户名称或助记码',
                                                value: "{{data.inputVal}}",
                                                onChange: "{{function (e) {$sf('data.inputVal', e.target.value)}}}",
                                                onPressEnter: '{{$handleInputValChange}}',
                                                prefix: {
                                                    name: 'search',
                                                    component: 'Icon',
                                                    type: 'search'
                                                }
                                            },
                                            {
                                                name: 'select',
                                                component: 'Select',
                                                className:"ttk-es-app-customer-digital-certificate-main-first-top-left-select",
                                                showSearch:false,
                                                getPopupContainer: '{{function(){return document.querySelector(".ttk-es-app-customer-digital-certificate")}}}',
                                                value: '{{data.applyType}}',
                                                placeholder: "请选择会计准则",
                                                // onFocus: '{{function(){$setField("data.other.error.accountingStandards", null)}}}',
                                                onChange: "{{$handleApplyTypeChange}}",
                                                children: {
                                                    name: 'option',
                                                    component: 'Select.Option',
                                                    value: '{{data.applyTypeList[_rowIndex].value}}',
                                                    children: '{{data.applyTypeList[_rowIndex].name}}',
                                                    _power: 'for in data.applyTypeList'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name:"right",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-first-top-right",
                                        children:[
                                            {
                                                name: 'apply',
                                                component: 'Button',
                                                className: 'ttk-es-app-customer-digital-certificate-main-first-top-right-button',
                                                children: '申请',
                                                type:'primary',
                                                onClick: '{{$handleApplyCommit}}'
                                            },
                                            {
                                                name: 'refresh',
                                                component: 'Button',
                                                className: 'ttk-es-app-customer-digital-certificate-main-first-top-right-button',
                                                children: '刷新状态',
                                                type:'primary',
                                                onClick: '{{$handleApplyRefresh}}'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:'table',
                                className:'ttk-es-app-customer-digital-certificate-main-first-table',
                                component: 'Table',
                                key: '{{data.id}}',
                                bordered: true,
                                scroll: '{{data.list.length?data.tableOption:undefined}}',
                                dataSource: '{{data.list}}',
                                columns: '{{$renderColumns()}}',
                                pagination: false,
                                rowKey: 'id',
                                emptyShowScroll:true,
                                delay: 0,
                                Checkbox: false,
                                rowSelection: {
                                    onChange:'{{$checkboxChange}}',
                                    selectedRowKeys:'{{data.tableCheckbox.checkboxValue}}',
                                },
                                enableSequenceColumn: false,
                                loading:'{{data.loading}}'
                            },
                            {
                                name: 'footer',
                                className: 'ttk-es-app-customer-digital-certificate-main-first-footer',
                                component: '::div',
                                children: [
                                    {
                                        name: 'num',
                                        component: '::span',
                                        className: 'ttk-es-app-mediation-list-table-footer-total',
                                        children: '{{"共" +data.pagination.totalCount+"条记录"}}'
                                    },
                                    {
                                        name: 'pagination',
                                        component: 'Pagination',
                                        pageSizeOptions: ['50', '100', '200', '300'],
                                        pageSize: '{{data.pagination.pageSize}}',
                                        current: '{{data.pagination.currentPage}}',
                                        total: '{{data.pagination.totalCount}}',
                                        onChange: '{{$pageChanged}}',
                                        onShowSizeChange: '{{$pageChanged}}'
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        name:"second",
                        component:'::div',
                        _visible:'{{data.activeNo==="2"}}',
                        className:"ttk-es-app-customer-digital-certificate-main-second",
                        children:[
                            {
                                name:"top",
                                component:'::div',
                                className:"ttk-es-app-customer-digital-certificate-main-second-top",
                                children:[
                                    {
                                        name:"left",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-second-top-left",
                                        children:[
                                            {
                                                name: 'tree',
                                                component: '::span',
                                                style: {
                                                    verticalAlign: 'middle',
                                                    marginRight: '8px'
                                                },
                                                children: '{{$renderSecondTree()}}'
                                            },
                                            {
                                                name: 'header-filter-input',
                                                component: 'Input',
                                                className: 'ttk-es-app-customer-digital-certificate-main-second-top-left-input',
                                                type: 'text',
                                                placeholder: '请输入客户名称或助记码',
                                                value: "{{data.inputValSecond}}",
                                                onChange: "{{function (e) {$sf('data.inputValSecond', e.target.value)}}}",
                                                onPressEnter: '{{$handleInputValSecondChange}}',
                                                prefix: {
                                                    name: 'search',
                                                    component: 'Icon',
                                                    type: 'search'
                                                }
                                            },
                                            {
                                                name: 'popover',
                                                component: 'Popover',
                                                popupClassName: 'inv-batch-custom-popover',
                                                placement: 'bottom',
                                                title: '',
                                                content: {
                                                    name: 'popover-content',
                                                    component: '::div',
                                                    className: 'inv-batch-custom-certificate-popover-content',
                                                    children: [
                                                        {
                                                            name: 'filter-content',
                                                            component: '::div',
                                                            className: 'filter-content',
                                                            children: [
                                                                {
                                                                    name: 'customer-type',
                                                                    component: '::div',
                                                                    className: 'inv-batch-custom-popover-item',
                                                                    children: [{
                                                                        name: 'label',
                                                                        component: '::span',
                                                                        children: '证书开通状态：',
                                                                        style:{display:'inline-block',width:'120px',textAlign:'right'},
                                                                        className: 'inv-batch-custom-popover-label'
                                                                    }, {
                                                                        name: 'select',
                                                                        component: 'Select',
                                                                        className: 'inv-batch-custom-popover-option',
                                                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                                        value: '{{data.formContent.applyStatus}}',
                                                                        onChange: "{{function (e) {$sf('data.formContent.applyStatus', e)}}}",
                                                                        children: {
                                                                            name: 'option',
                                                                            component: '::Select.Option',
                                                                            children: '{{data.applyStatusList[_rowIndex].name}}',
                                                                            value: '{{data.applyStatusList[_rowIndex].value}}',
                                                                            _power: 'for in data.applyStatusList',
                                                                        }
                                                                    }]
                                                                },
                                                                {
                                                                    name: 'customer-messsage',
                                                                    component: '::div',
                                                                    className: 'inv-batch-custom-popover-item',
                                                                    children: [{
                                                                        name: 'label',
                                                                        component: '::span',
                                                                        children: '申请日期：',
                                                                        style:{display:'inline-block',width:'120px',textAlign:'right'},
                                                                        className: 'inv-batch-custom-popover-label'
                                                                    }, {
                                                                        name: 'dzsj',
                                                                        component: '::span',
                                                                        style:{width:'266px',},
                                                                        children:[{
                                                                            name: 'dzsjbegin',
                                                                            component: 'DatePicker',
                                                                            style:{width:'120px',textAlign:'center'},
                                                                            allowClear:true,
                                                                            disabledDate:'{{$disabledFirstDate}}',
                                                                            getCalendarContainer: '{{function(){return document.querySelector(".inv-batch-custom-certificate-popover-content")}}}',
                                                                            value: '{{$stringToMoment((data.formContent.debitStartDate), "YYYY-MM-DD")}}',
                                                                            onChange: "{{function(v) {$sf('data.formContent.debitStartDate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                                                        },
                                                                            {
                                                                                name:'dz_spline',
                                                                                component:'::span',
                                                                                style:{width:'20px',textAlign:'center',padding:'0 6px'},
                                                                                children:'-'
                                                                            },
                                                                            {
                                                                                name: 'dzsjend',
                                                                                component: 'DatePicker',
                                                                                style:{width:'120px',textAlign:'center'},
                                                                                allowClear:true,
                                                                                disabledDate:'{{$disabledEndDate}}',
                                                                                getCalendarContainer: '{{function(){return document.querySelector(".inv-batch-custom-certificate-popover-content")}}}',
                                                                                value: '{{$stringToMoment((data.formContent.debitEndDate), "YYYY-MM-DD")}}',
                                                                                onChange: "{{function(v) {$sf('data.formContent.debitEndDate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                                                            }
                                                                        ]
                                                                    }]
                                                                },
                                                            ]
                                                        }, {
                                                            name: 'filter-footer',
                                                            component: '::div',
                                                            className: 'filter-footer',
                                                            children: [
                                                                {
                                                                    name: 'search',
                                                                    component: 'Button',
                                                                    type: 'primary',
                                                                    children: '查询',
                                                                    onClick: '{{$handleSecondPopoverCommit}}'
                                                                },{
                                                                    name: 'reset',
                                                                    className: 'reset-btn',
                                                                    component: 'Button',
                                                                    children: '重置',
                                                                    style:{marginRight:'10px'},
                                                                    onClick: '{{$handleSecondPopoverReset}}'
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
                                                    className: 'ttk-es-app-customer-digital-certificate-main-second-top-left-date',
                                                    children: {
                                                        name: 'filter',
                                                        component: 'Icon',
                                                        type: 'filter'
                                                    }
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        name:"right",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-second-top-right",
                                        children:[
                                            {
                                                name: 'print',
                                                component: 'Button',
                                                className: 'ttk-es-app-customer-digital-certificate-main-second-top-right-button',
                                                children: '批量打印',
                                                type:'primary',
                                                onClick: '{{$openViewApplyBatch}}'
                                            },
                                            {
                                                name: 'dowload',
                                                component: 'Button',
                                                className: 'ttk-es-app-customer-digital-certificate-main-second-top-right-button',
                                                children: '批量下载',
                                                type:'primary',
                                                onClick: '{{$downloadPDFBatch}}'
                                            },
                                            {
                                                name: 'refresh',
                                                component: 'Button',
                                                className: 'ttk-es-app-customer-digital-certificate-main-second-top-right-button',
                                                children: '更新状态',
                                                type:'primary',
                                                onClick: '{{$handleApplySecondRefresh}}'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:'table',
                                className:'ttk-es-app-customer-digital-certificate-main-first-table',
                                component: 'Table',
                                key: '{{data.id}}',
                                bordered: true,
                                scroll: '{{data.list.length?data.tableOption:undefined}}',
                                dataSource: '{{data.secondList}}',
                                columns: '{{$renderSecondColumns()}}',
                                pagination: false,
                                rowKey: 'id',
                                emptyShowScroll:true,
                                delay: 0,
                                Checkbox: false,
                                rowSelection: {
                                    onChange:'{{$checkboxChangeSecond}}',
                                    selectedRowKeys:'{{data.tableCheckboxSecond.checkboxValue}}',
                                },
                                enableSequenceColumn: false,
                                loading:'{{data.loadingSecond}}'
                            },
                            {
                                name: 'footer',
                                className: 'ttk-es-app-customer-digital-certificate-main-first-footer',
                                component: '::div',
                                children: [
                                    {
                                        name: 'num',
                                        component: '::span',
                                        className: 'ttk-es-app-mediation-list-table-footer-total',
                                        children: '{{"共" +data.secondPagination.totalCount+"条记录"}}'
                                    },
                                    {
                                        name: 'pagination',
                                        component: 'Pagination',
                                        pageSizeOptions: ['50', '100', '200', '300'],
                                        pageSize: '{{data.secondPagination.pageSize}}',
                                        current: '{{data.secondPagination.currentPage}}',
                                        total: '{{data.secondPagination.totalCount}}',
                                        onChange: '{{$pageSecondChanged}}',
                                        onShowSizeChange: '{{$pageSecondChanged}}'
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        name:"third",
                        component:'::div',
                        _visible:'{{data.activeNo==="3"}}',
                        className:"ttk-es-app-customer-digital-certificate-main-third",
                        children:[
                            {
                                name:"item1",
                                component:'::div',
                                className:"ttk-es-app-customer-digital-certificate-main-third-item1",
                                children:[
                                    {
                                        name:"value",
                                        component:'::span',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item1-value",
                                        children:'1、请将打印好的委托书，加盖'
                                    },
                                    {
                                        name:"weight",
                                        component:'::b',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item1-weight",
                                        children:'被代账企业的公章，并由财务负责人或法人签字。'
                                    }
                                ]
                            },
                            {
                                name:"item2",
                                component:'::div',
                                className:"ttk-es-app-customer-digital-certificate-main-third-item2",
                                children:[
                                    {
                                        name:"value",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item2-value",
                                        children:'2、请将改好公章的委托书，邮寄至如下地址：'
                                    },
                                    {
                                        name:"address",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item2-address",
                                        children:[
                                            {
                                                name:"address1",
                                                component:'::span',
                                                className:"ttk-es-app-customer-digital-certificate-main-third-item2-address-value1",
                                                children:'地址：广州市天河区绿地中央广场C4栋，金财互联信息技术有限公司'
                                            },
                                            {
                                                name:"address2",
                                                component:'::span',
                                                className:"ttk-es-app-customer-digital-certificate-main-third-item2-address-value2",
                                                children:'邮编：510300'
                                            }
                                        ]
                                    },
                                    {
                                        name:"user",
                                        component:'::div',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item2-user",
                                        children:[
                                            {
                                                name:"user",
                                                component:'::span',
                                                className:"ttk-es-app-customer-digital-certificate-main-third-item2-user-value1",
                                                children:'收件人：X先生'
                                            },
                                            {
                                                name:"user",
                                                component:'::span',
                                                className:"ttk-es-app-customer-digital-certificate-main-third-item2-user-value2",
                                                children:'186XXXXXXXX'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:"item3",
                                component:'::div',
                                className:"ttk-es-app-customer-digital-certificate-main-third-item3",
                                children:[
                                    {
                                        name:"value",
                                        component:'::span',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item3-value",
                                        children:'3、3-5个工作日后，请在【客户资料】模块'
                                    },
                                    {
                                        name:"weight",
                                        component:'::b',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item3-weight",
                                        children:'更新客户状态'
                                    },
                                    {
                                        name:"value",
                                        component:'::span',
                                        className:"ttk-es-app-customer-digital-certificate-main-third-item3-value",
                                        children:'当数字证书开通状态变为【已开通】时，即表示数字证书已经开通，就可使用数字证书的便捷服务了。'
                                    }
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                name:"tip1",
                component:'::div',
                className:"ttk-es-app-customer-digital-certificate-tip",
                children:[
                    {
                        name:"value",
                        component:'::a',
                        className:"ttk-es-app-customer-digital-certificate-tip-value",
                        children:'数字证书有什么用'
                    }
                ]
            },
            {
                name:"tip2",
                component:'::div',
                className:"ttk-es-app-customer-digital-certificate-tip2",
                children:[
                    {
                        name:"title",
                        component:'::span',
                        className:"ttk-es-app-customer-digital-certificate-tip2-title",
                        children:'温馨提示：'
                    },
                    {
                        name:"value",
                        component:'::span',
                        className:"ttk-es-app-customer-digital-certificate-tip2-value",
                        children:'下载纳税人信息后，才可申请数字证书'
                    }
                ]
            },
            {
                name:"spins",
                component:'::div',
                className:"ttk-es-app-customer-digital-certificate-spins",
                _visible: '{{data.spinLoading}}',
                children:[
                    {
                        name: 'spin',
                        component: 'Spin',
                        className:"ttk-es-app-customer-digital-certificate-spins-spin ant-spin-container",
                        tip: '数据加载中...',
                        delay:1,
                        size: 'large',
                    }
                ]
            }
        ]
    }
}

export function getInitState() {
    return {
        data:{
            activeNo:'1',
            inputVal:'',
            inputValSecond:'',
            applyType:'000',
            other: {
                permission: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
                },
                permissionSecond: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
                },
            },
            showbm:'分配给我的客户',
            showbmSecond:'分配给我的客户',
            buttonNameFirst:'分配给我的客户',
            buttonNameSecond:'分配给我的客户',
            ifgs:'',
            ifgsSecond:'',
            maxde:'',
            maxdeSecond:'',
            checkedKeys: {
                checked: [],//全选
                itemChecked: [],
                halfChecked: []//半选
            },
            checkedKeysSecond: {
                checked: [],//全选
                itemChecked: [],
                halfChecked: []//半选
            },
            applyTypeList:[
                {name:'全部',value:'000'},
                {name:'未申请',value:'001'},
                {name:'提交中',value:'002'},
                {name:'提交成功',value:'003'},
                {name:'提交失败',value:'004'}
            ],
            applyStatusList:[
                {name:'全部',value:'005'},
                {name:'申请中',value:'003'},
                {name:'已开通',value:'007'},
                {name:'开通失败',value:'008'},
            ],
            list:[],
            secondList:[],
            columns: [
                // {
                //     id: 'id',
                //     caption: "ID",
                //     fieldName: 'id',
                //     // isFixed: true,
                //     isVisible: true,
                //     width: '10%',
                //     // isMustSelect: true,
                //     align: 'center',
                //     className:'',
                // },
                {
                    id: 'name',
                    caption: "客户名称",
                    fieldName: 'name',
                    // isFixed: true,
                    isVisible: true,
                    width: '25%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'helpCode',
                    caption: "助记码",
                    fieldName: 'helpCode',
                    // isFixed: true,
                    isVisible: true,
                    width: '15%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'nsrsbh',
                    caption: "纳税人识别号",
                    fieldName: 'nsrsbh',
                    // isFixed: true,
                    isVisible: true,
                    width: '25%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'vatTaxpayer',
                    caption: "纳税人性质",
                    fieldName: 'vatTaxpayer',
                    // isFixed: true,
                    isVisible: true,
                    width: '20%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'ktzssqzt',
                    caption: "申请提交结果",
                    fieldName: 'ktzssqzt',
                    // isFixed: true,
                    isVisible: true,
                    width: '15%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
            ],
            secondColumns: [
                // {
                //     id: 'id',
                //     caption: "ID",
                //     fieldName: 'id',
                //     // isFixed: true,
                //     isVisible: true,
                //     width: '10%',
                //     // isMustSelect: true,
                //     align: 'center',
                //     className:'',
                // },
                {
                    id: 'name',
                    caption: "客户名称",
                    fieldName: 'name',
                    // isFixed: true,
                    isVisible: true,
                    width: '22%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'helpCode',
                    caption: "助记码",
                    fieldName: 'helpCode',
                    // isFixed: true,
                    isVisible: true,
                    width: '10%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'nsrsbh',
                    caption: "纳税人识别号",
                    fieldName: 'nsrsbh',
                    // isFixed: true,
                    isVisible: true,
                    width: '19%',
                    // isMustSelect: true,
                    align: 'left',
                    className:'',
                },
                {
                    id: 'ktzssqrmc',
                    caption: "申请人",
                    fieldName: 'ktzssqrmc',
                    // isFixed: true,
                    isVisible: true,
                    width: '10%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'ktzssqsj',
                    caption: "申请时间",
                    fieldName: 'ktzssqsj',
                    // isFixed: true,
                    isVisible: true,
                    width: '17%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'ktzssqzt',
                    caption: "证书开通状态",
                    fieldName: 'ktzssqzt',
                    // isFixed: true,
                    isVisible: true,
                    width: '12%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
                {
                    id: 'operation',
                    caption: "授权委托书",
                    fieldName: 'operation',
                    // isFixed: true,
                    isVisible: true,
                    width: '10%',
                    // isMustSelect: true,
                    align: 'center',
                    className:'',
                },
            ],
            pagination: {//分页
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            secondPagination: {//分页
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            loading:false,
            loadingSecond:false,
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            tableCheckboxSecond: {
                checkboxValue: [],
                selectedOption: []
            },
            showPopoverCard: false,
            filterForm: {//隐藏的筛选条件
                applyStatus: '005',
                debitStartDate: '',
                debitEndDate: '',
                applyDate: [],
            },
            formContent: {
                applyStatus: '005',
                debitStartDate: '',
                debitEndDate: '',
                applyDate: [],
            },
            spinLoading:false
        }
    }
}