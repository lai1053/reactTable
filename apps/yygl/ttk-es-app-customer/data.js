import { generalBtnType, columnData } from './fixedData'
import moment from 'moment';
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-customer',
        children: {
            name: 'spin-box',
            component: 'Spin',
            spinning:  '{{data.loading}}',
            size: 'large',
            tip: '数据加载中...',
            delay: 1,
            wrapperClassName: 'spin-box ttk-es-app-customer-spin-box',
            children: [
                // {//表头配置
                //     name: 'tablesetting',
                //     component: 'TableSettingCard',
                //     data: '{{data.other.columnDto}}',
                //     showTitle: '{{data.showTitle}}',
                //     positionClass: 'inv-batch-custom-table',
                //     visible: '{{data.showTableSetting}}',//显示隐藏控制
                //     confirmClick: '{{function(data){$upDateTableSetting({value: false, data: data})}}}',
                //     cancelClick: '{{function(){$closeTableSetting()}}}',
                //     resetClick: '{{function(){$resetTableSetting({data: data})}}}'
                // },
                {
                    name: 'inv-batch-cost-nav',
                    component: '::div',
                    className: 'inv-batch-custom-list-div',
                    children: [{
                        name: 'inv-batch-nav',
                        component: 'Tabs',
                        activeKey:'{{data.serviceCode}}',
                        onChange: "{{$tabChange}}",
                        children: [{
                            name: 'general',
                            component: 'Tabs.TabPane',
                            tab: '正常客户',
                            key: '1'
                        }, {
                            name: 'small-scale',
                            component: 'Tabs.TabPane',
                            tab: '停用客户',
                            key: '0'
                        }]
                    },
                        {
                            name:'customer-excess-title',
                            _visible:'{{data.excessStatus}}',
                            className:'customer-excess-title',
                            component:'::div',
                            children:[
                                {
                                    name:'customer-excess-title-span',
                                    component:'::span',
                                    children:'客户数量已超额，全公司正常客户：',
                                },
                                {
                                    name:'customer-excess-title-span1',
                                    component:'::span',
                                    children:'{{data.excess.normal}}',
                                },
                                {
                                    name:'customer-excess-title-span2',
                                    component:'::span',
                                    children:'，限额：',
                                },
                                {
                                    name:'customer-excess-title-span3',
                                    component:'::span',
                                    children:'{{data.excess.number}}',
                                },
                            ]
                        },
                    ]
                },
                {
                    name: 'inv-batch-custom-header',
                    component: '::div',
                    className: 'inv-batch-custom-header',
                    children: [
                        {
                            name: 'header-left',
                            className: 'header-left',
                            component: '::div',
                            children: [
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
                                    className: 'inv-batch-custom-header-filter-input',
                                    type: 'text',
                                    placeholder: '请输入客户名称或助记码',
                                    value: "{{data.inputVal}}",
                                    onChange: "{{function (e) {$sf('data.inputVal', e.target.value)}}}",
                                    onPressEnter: '{{$onSearch}}',
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
                                        className: 'inv-batch-custom-popover-content',
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
                                                            children: '客户类型：',
                                                            style:{display:'inline-block',width:'120px'},
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.customerTypeStatus}}',
                                                            onChange: "{{function (e) {$sf('data.formContent.customerTypeStatus', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.customerType[_rowIndex].name}}',
                                                                value: '{{data.customerType[_rowIndex].value}}',
                                                                _power: 'for in data.customerType',
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
                                                            children: '纳税人信息：',
                                                            style:{display:'inline-block',width:'120px'},
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.nsrMessStatus}}',
                                                            onChange: "{{$nsrMessStatusChange}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.nsrMess[_rowIndex].name}}',
                                                                value: '{{data.nsrMess[_rowIndex].value}}',
                                                                _power: 'for in data.nsrMess'
                                                            }
                                                        }]
                                                    },
                                                    // {
                                                    //     name: 'message-commit',
                                                    //     component: '::div',
                                                    //     className: 'inv-batch-custom-popover-item',
                                                    //     children: [{
                                                    //         name: 'label',
                                                    //         component: '::span',
                                                    //         children: '信息是否完整：',
                                                    //         style:{display:'inline-block',width:'120px',textAlign:'right'},
                                                    //         className: 'inv-batch-custom-popover-label'
                                                    //     }, {
                                                    //         name: 'select',
                                                    //         component: 'Select',
                                                    //         disabled:'{{data.formContent.nsrMessStatus!==""&&data.formContent.nsrMessStatus!=="1"}}',
                                                    //         className: 'inv-batch-custom-popover-option',
                                                    //         getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                    //         value: '{{data.formContent.messageWholeStatus}}',
                                                    //         onChange: "{{function (e) {$sf('data.formContent.messageWholeStatus', e)}}}",
                                                    //         children: {
                                                    //             name: 'option',
                                                    //             component: '::Select.Option',
                                                    //             children: '{{data.isWhole[_rowIndex].name}}',
                                                    //             value: '{{data.isWhole[_rowIndex].value}}',
                                                    //             _power: 'for in data.isWhole'
                                                    //         }
                                                    //     },{
                                                    //         name: 'popover',
                                                    //         component: 'Popover',
                                                    //         popupClassName: 'customer-info-state-not-control-popover',
                                                    //         placement: 'bottom',
                                                    //         title: '',
                                                    //         content: '纳税人信息选择【全部】和【已下载】时可选择',
                                                    //         children: {
                                                    //             name: 'update',
                                                    //             component: 'Icon',
                                                    //             fontFamily: 'edficon',
                                                    //             type: 'bangzhutishi',
                                                    //             style: {
                                                    //                 fontSize: 23,
                                                    //                 cursor: 'pointer'
                                                    //             },
                                                    //             title: '提示',
                                                    //         }
                                                    //     }]
                                                    // },
                                                    {
                                                        name: 'areaItem',
                                                        component: 'Form.Item',
                                                        label: '所属区域',
                                                        // style:{display:'inline-block',width:'120px',textAlign:'right'},
                                                        className: 'areaItemAddress',
                                                        children: [
                                                            {
                                                            name: 'detail',
                                                            component: 'Address',
                                                            value: {disabled: false},
                                                            showDetail: false,
                                                            width: 123,
                                                            style:{float:'right'},
                                                            // height: 50,
                                                            provinces: '{{data.area.registeredProvincial}}',
                                                            citys: '{{data.area.registeredCity}}',
                                                            districts: '{{data.area.registeredCounty}}',
                                                            text: '{{data.area.registeredAddress}}',
                                                            onChange: "{{function(e) {$setAddress(e)}}}",
                                                            getPopupContainer:".areaItemAddress",
                                                            // isRequired: true
                                                        }]
                                                    },
                                                    {
                                                        name: 'service-type',
                                                        component: '::div',
                                                        className: 'inv-batch-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '服务类型：',
                                                            style:{display:'inline-block',width:'120px'},
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select-service-type',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.serviceTypeStatus}}',
                                                            onChange: "{{function (e) {$sf('data.formContent.serviceTypeStatus', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.serviceType[_rowIndex].name}}',
                                                                value: '{{data.serviceType[_rowIndex].value}}',
                                                                _power: 'for in data.serviceType',
                                                            }
                                                        }]
                                                    },
                                                    {
                                                        name: 'fjbssjhyz',
                                                        component: '::div',
                                                        className: 'inv-batch-custom-popover-item',
                                                        style:{position:'relative'},
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '办税手机号验证：',
                                                            style:{display:'inline-block',width:'120px'},
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select-bssjhyz',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.fjbssjhyzStatus}}',
                                                            onChange: "{{function (e) {$sf('data.formContent.fjbssjhyzStatus', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.fjbssjhyz[_rowIndex].name}}',
                                                                value: '{{data.fjbssjhyz[_rowIndex].value}}',
                                                                _power: 'for in data.fjbssjhyz',
                                                            }
                                                        },{
                                                            name: 'service-fjbsr-popover',
                                                            component: 'Popover',
                                                            content: '仅适用福建省（除厦门外）的企业的筛选',
                                                            placement: 'right',
                                                            overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                                            children: {
                                                                name: 'icon',
                                                                component: 'Icon',
                                                                fontFamily: 'edficon',
                                                                type: 'XDZtishi',
                                                                style:{
                                                                    color:'#0066b3',
                                                                    fontSize:'17px',
                                                                    marginLeft: '10px',
                                                                    position:'absolute',
                                                                    top:'10px',

                                                                }
                                                            }
                                                        }]
                                                    },
                                                    {
                                                        name: 'sgemmjy',
                                                        component: '::div',
                                                        className: 'inv-batch-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '个税密码校验：',
                                                            style:{display:'inline-block',width:'120px'},
                                                            className: 'inv-batch-custom-popover-label'
                                                        }, {
                                                            name: 'select-gsmmjy-type',
                                                            component: 'Select',
                                                            className: 'inv-batch-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.formContent.gsmmjyStatus}}',
                                                            onChange: "{{function (e) {$sf('data.formContent.gsmmjyStatus', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.gsmmjy[_rowIndex].name}}',
                                                                value: '{{data.gsmmjy[_rowIndex].value}}',
                                                                _power: 'for in data.gsmmjy',
                                                            }
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
                                                        onClick: '{{$filterList}}'
                                                    },{
                                                        name: 'reset',
                                                        className: 'reset-btn',
                                                        component: 'Button',
                                                        children: '重置',
                                                        style:{marginRight:'10px'},
                                                        onClick: '{{$resetForm}}'
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
                                        className: 'inv-batch-custom-filter-btn header-item',
                                        children: {
                                            name: 'filter',
                                            component: 'Icon',
                                            type: 'filter'
                                        }
                                    }
                                },
                                {
                                    name:'refresh',
                                    component:'Button',
                                    className: 'inv-batch-custom-header-filter-refresh',
                                    _visible:'{{data.serviceCode == 1}}',
                                    children: {
                                        name: 'userIcon',
                                        className: 'refresh-btn',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'shuaxin'
                                    },
                                    onClick: '{{$refreshCustomerList}}'
                                },
                                {
                                    name:'protocol_a',
                                    component:'::a',
                                    _visible:'{{data.serviceCode == 1&&data.permissionIds.includes("20010_200_1_300")&&!data.excessStatus}}',
                                    children:'下载进度',
                                    onClick:'{{$downloadProgress}}'
                                }
                                // {
                                //     name: 'tax-month',
                                //     component: '::span',
                                //     className: 'tax-month header-item',
                                //     children: [{
                                //         name: 'label',
                                //         component: '::label',
                                //         children: '报税月份：'
                                //     }, {
                                //         name: 'tax-date-picker',
                                //         component: 'DatePicker.MonthPicker',
                                //         value: '{{data.nsqj}}',
                                //         format: 'YYYY-MM',
                                //         onChange: "{{$handleMonthPickerChange}}"
                                //     }]
                                // }
                                ]
                        },
                        {
                            name: 'header-right',
                            className: 'header-right',
                            component: '::div',
                            children: [
                                {
                                    name: '{{data.btnType[_rowIndex].name}}',
                                    //style:'{{{return{width:800}}}}',
                                    className: '{{data.btnType[_rowIndex].className}}',
                                    component: 'Button',
                                    _visible:'{{data.permissionIds.includes(data.btnType[_rowIndex].btnId)&&(!data.excessStatus||data.serviceCode == 0)}}',
                                    type: '{{data.btnType[_rowIndex].type}}',
                                    children: '{{data.btnType[_rowIndex].children}}',
                                    _power: "for in data.btnType",
                                    onClick: '{{function () {$judgeChoseBill(data.btnType[_rowIndex].key)}}}'
                                },
                                {//更多操作
                                    name:'moreOpr',
                                    component:'Dropdown',
                                    className:'ant-dropdown-link',
                                    _visible:'{{data.serviceCode == 1 && data.containsOthers}}',
                                    overlay:{
                                        name:'menu0',
                                        component:'Menu',
                                        style:{textAlign:'center'},
                                        children:[
                                            {
                                                name:'menu4',
                                                component: 'Menu.Item',
                                                key:'exportBJbsr',
                                                children: '导入办税人',
                                                _visible:'{{data.permissionIds.includes("20010_300_1_102")&&!data.excessStatus}}',
                                                onClick:'{{function(){$bjTaxOfficerImport()}}}'
                                            },
                                            {
                                                name:'menu5',
                                                component: 'Menu.Item',
                                                key:'gsmmjy',
                                                children: '个税密码校验',
                                                _visible:'{{data.permissionIds.includes("20010_200_1_400")&&!data.excessStatus}}',
                                                onClick:'{{function(){$gsmmjy(data.orgArr)}}}',
                                            },
                                            {
                                                name:'menu6',
                                                component: 'Menu.Item',
                                                key:'gxgsmmzt',
                                                children: '更新个税密码状态',
                                                _visible:'{{data.permissionIds.includes("20010_200_1_500")&&!data.excessStatus}}',
                                                onClick:'{{$updateGSMMStatus}}',
                                            },
                                            {
                                            name:'menu1',
                                            component: 'Menu.Item',
                                            key:'export',
                                            children: '导出',
                                                _visible:'{{data.permissionIds.includes("20010_300_1_400")}}',
                                             onClick:'{{data.list != "" && $exportCustomer}}'
                                        },
                                            {
                                            name:'menu2',
                                            component: 'Menu.Item',
                                            key:'delete',
                                            children: '删除',
                                                _visible:'{{data.permissionIds.includes("20010_400_1_100")}}',
                                            onClick:'{{function(){$delCustomer(data.checkChoosed,data.orgArr)}}}'
                                        },
                                            {
                                                name:'menu3',
                                                component: 'Menu.Item',
                                                key:'stop',
                                                children: '停用',
                                                _visible:'{{data.permissionIds.includes("20010_300_1_900")}}',
                                                onClick:'{{function(){$stopMoreCustomer(data.serviceCode,data.checkChoosed,data.orgArr)}}}',
                                            },
                                            // {
                                            //     name:'menu4',
                                            //     component: 'Menu.Item',
                                            //     key:'bathUpdate',
                                            //     children: '批量修改',
                                            //     onClick:'{{$batchCustomerUpdate}}',
                                            // },
                                        ]
                                    },
                                    children:{
                                        name:'menu4',
                                        component: 'Button',
                                        children: ['更多',{
                                            name:'moreIcon',
                                            component:'Icon',
                                            fontFamily:'',
                                            style:{fontSize:'18px',verticalAlign:'middle'},
                                            type:'down'
                                        }]
                                    }

                                }
                            ]
                        }
                    ],
                },
                {
                    name: '{{data.TaxpayerNature}}',
                    className: 'inv-batch-custom-table',
                    component: 'Table',
                    key: '{{data.TaxpayerNature}}',
                    //loading: '{{data.loading}}',
                    // checkboxChange: '{{$checkboxChange}}',
                    bordered: true,
                    scroll: '{{data.list.length?data.tableOption:undefined}}',
                    dataSource: '{{data.list}}',
                    columns: '{{$renderColumns()}}',
                    // checkboxKey: 'id',
                    pagination: false,
                    rowKey: 'id',
                    // checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
                    // checkboxFixed: true,
                    emptyShowScroll:true,
                    delay: 0,
                    rowSelection: {
                        onChange:'{{$checkboxChange}}',
                        selectedRowKeys:'{{data.tableCheckbox.checkboxValue}}',
                        getCheckboxProps:'{{$getCheckboxProps}}'
                    },
                    Checkbox: false,
                    enableSequenceColumn: false,
                    // allowColResize: true,
                    scrollToFirstRowOnChange:false
                }, {
                    name: 'footer',
                    className: 'inv-batch-custom-footer',
                    component: '::div',
                    // style:{position:'relative'},
                    children: [{
                        name: 'pagination',
                        component: 'Pagination',
                        pageSizeOptions: ['50', '100', '200', '300'],
                        pageSize: '{{data.pagination.pageSize}}',
                        current: '{{data.pagination.currentPage}}',
                        total: '{{data.pagination.totalCount}}',
                        onChange: '{{$pageChanged}}',
                        onShowSizeChange: '{{$pageChanged}}'
                    },{
                            name: 'num',
                            component: '::span',
                            style:{position:'relative',float:'right',top:'5px',marginRight:'10px',fontSize:'14px',color:'rgba(0,0,0,0.65)'},
                            children: '{{"共" +data.pagination.totalCount+"条记录"}}'
                        },
                    ]
                }]
        },

    }
}

export function getInitState() {
    return {
        data: {
            btnType: generalBtnType,//右上角按钮显示
            serviceCode: '1',//正常客户显示
            // nsqj: '',
            khRangeList: [{//权限
                rangeName: '分配给我的客户',
                rangeType: 'self'
            }],
            khRange: 'self',
            inputVal: '',//搜索框
            filterForm: {//隐藏的筛选条件
                customerTypeStatus: '',
                nsrMessStatus: '',
                messageWholeStatus: '',
                sfdm:'',
                csdm:'',
                qxdm:'',
                serviceTypeStatus: '000',
                fjbssjhyzStatus: '2',
                gsmmjyStatus:'999'
            },
            filterFormOld: {
                customerTypeStatus: '',
                nsrMessStatus: '',
                messageWholeStatus: '',
                sfdm:'',
                csdm:'',
                qxdm:'',
                serviceTypeStatus: '000',
                fjbssjhyzStatus: '2',
                gsmmjyStatus:'999'
            },
            formContent: {
                customerTypeStatus: '',
                nsrMessStatus: '',
                messageWholeStatus: '',
                sfdm:'',
                csdm:'',
                qxdm:'',
                serviceTypeStatus: '000',
                fjbssjhyzStatus: '2',
                gsmmjyStatus:'999'
            },
            customerType: [{//客户类型
                name: '全部',
                value: ''
            }, {
                name: '一般纳税人',
                value: '2000010001'
            }, {
                name: '小规模',
                value: '2000010002'
            }],
            nsrMess:[{//纳税人状态
                name: '全部',
                value: ''
            },{
                name: '已下载',
                value: '1'
            },{
                name: '未下载',
                value: '0'
            },{
                name: '下载中',
                value: '3'
            },{
                name: '下载失败',
                value: '2'
            },],
            isWhole:[
                {
                    name: '全部',
                    value: ''
                },
                {
                    name: '完整',
                    value: '0'
                },
                {
                    name: '不完整',
                    value: '1'
                }
            ],
            loading: false,//动画加载
            list: [//数据展示
            //     {
            //     key: '1',
            //     name: '陈信宏',
            //     helpCode: 'A00001',
            //     nsrsbh: 'DE444333356676',
            //     ssqy: '台湾省台北市',
            //     psb: '已开通',
            //         infoState: '0',
            // },{
            //     key: '2',
            //     khmc: '刘昊然',
            //     mneCode: 'A00002',
            //     nsrsbh: 'DE444333356676',
            //     ssqy: '山东省青岛市',
            //     psb: '未开通',
            //     nsrxx: '未下载',
            // },{
            //     key: '3',
            //     khmc: '胡一天',
            //     mneCode: 'A00003',
            //     nsrsbh: 'DE444333356678',
            //     ssqy: '山东省青岛市',
            //     psb: '未开通',
            //     nsrxx: '下载失败',
            // }
            ],
            tableOption: {
                // x: 1500
            },
            pagination: {//分页
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
            },
            showTableSetting: false,
            other: {
                columnDto: [],
                permission: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
                },
                areaQueryArr:{},
            },
            maxde:'',
            showbm:'分配给我的客户',
            ifgs:'',
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
            columnData,//表头数据
            columns: [],//存放表头数据
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            downloadNSRXX:[],
            showPopoverCard: false,
            loadTime: '',

            nsrxx:[],
            area:{},
            checkChoosed:[],
            orgArr:[],
            serviceType:[{//服务类型
                name: '全部',
                value: '000'
            },{
                name: '全部服务',
                value: '003'
            }, {
                name: '一次性服务',
                value: '001'
            }, {
                name: '周期性服务',
                value: '002'
            }],
            fjbssjhyz:[
                {//福建办税人手机号验证
                    name: '全部',
                    value: '2'
                },{
                    name: '已验证',
                    value: '1'
                },
                // {
                //     name: '验证失败',
                //     value: '-1'
                // },
                {
                    name: '未验证',
                    value: '0'
                }
            ],
            gsmmjy:[
                {//个税密码校验
                    name: '全部',
                    value: '999'
                },{
                    name: '未校验',
                    value: '000'
                },
                {
                    name: '通过',
                    value: '002'
                },
                {
                    name: '密码错误',
                    value: '003'
                },
                {
                    name: '校验中',
                    value: '001'
                }
            ],
            permission200Id:[],
            permission300Id:[],
            permission400Id:[],
            permissionIds:[],
            containsOthers:false,
            excessStatus:false,
            excess:{
                normal:109,
                number:100,
            },

        }
    }
}