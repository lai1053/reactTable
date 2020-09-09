export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage',
        children: [
            {
                name: 'content',
                component: 'Card',
                className: 'ttk-es-app-ztmanage-content',
                extra: {
                    name: 'header',
                    component: '::div',
                    className: 'ttk-es-app-ztmanage-content-header',
                    children: [ {
                        name: 'leftbox',
                        component: '::div',
                        className:'ttk-es-app-ztmanage-content-header-leftbox',
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
                                        name: 'inventoryName',
                                        component: 'Input.Search',
                                        showSearch: true,
                                        placeholder: '请输入客户名称或助记码',
                                        className:'ttk-es-app-ztmanage-content-header-search',
                                        value:'{{data.entity.seachtext}}',
                                        onChange: `{{function(e){$sf('data.entity.seachtext',e.target.value);$search()}}}`,
                                        onPressEnter: '{{$search}}',//按下回车时回调
                                  },
                            {
                                    name: 'popover',
                                    component: 'Popover',
                                    popupClassName: 'inv-ztgl-custom-popover',
                                    placement: 'bottom',
                                    title: '',
                                    content: {
                                        name: 'popover-content',
                                        component: '::div',
                                        className: 'inv-ztgl-custom-popover-content',
                                        children: [
                                            {
                                                name: 'filter-content',
                                                component: '::div',
                                                className: 'filter-content',
                                                children: [
                                                    {
                                                        name: 'dz-type',
                                                        component: '::div',
                                                        className: 'inv-ztgl-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '导账结果：',
                                                            style:{display:'inline-block',width:'80px',textAlign:'right'},
                                                            className: 'inv-ztgl-custom-popover-label'
                                                        }, {
                                                            name: 'selectDzjg',
                                                            component: 'Select',
                                                            className: 'inv-ztgl-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.entity.debitState}}',
                                                            onChange: "{{function (e) {$sf('data.entity.debitState', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.dzResult[_rowIndex].name}}',
                                                                value: '{{data.dzResult[_rowIndex].value}}',
                                                                _power: 'for in data.dzResult',
                                                            }
                                                        }]
                                                    },
                                                    {
                                                        name: 'dzsjmain',
                                                        component: '::div',
                                                        className: 'inv-ztgl-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '导账时间：',
                                                            style:{display:'inline-block',width:'80px',textAlign:'right'},
                                                            className: 'inv-ztgl-custom-popover-label'
                                                        }, {
                                                            name: 'dzsj',
                                                            component: '::span',
                                                            style:{width:'266px',},
                                                            children:[{
                                                                    name: 'dzsjbegin',
                                                                    component: 'DatePicker',
                                                                    style:{width:'120px',textAlign:'center'},
                                                                    getCalendarContainer: '{{function(){return document.querySelector(".inv-ztgl-custom-popover-content")}}}',
                                                                    value: '{{$stringToMoment((data.entity.debitStartDate), "YYYY-MM-DD")}}',
                                                                    onChange: "{{function(v) {$sf('data.entity.debitStartDate', $momentToString(v,'YYYY-MM-DD'))}}}",
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
                                                                    getCalendarContainer: '{{function(){return document.querySelector(".inv-ztgl-custom-popover-content")}}}',
                                                                    value: '{{$stringToMoment((data.entity.debitEndDate), "YYYY-MM-DD")}}',
                                                                    onChange: "{{function(v) {$sf('data.entity.debitEndDate', $momentToString(v,'YYYY-MM-DD'))}}}",
                                                                }
                                                             ] 
                                                        }]
                                                    }, 
                                                    {
                                                        name: 'customer-messsage',
                                                        component: '::div',
                                                        className: 'inv-ztgl-custom-popover-item',
                                                        children: [{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '导账人员：',
                                                            style:{display:'inline-block',width:'80px',textAlign:'right'},
                                                            className: 'inv-ztgl-custom-popover-label'
                                                        }, {
                                                            name: 'selectDzry',
                                                            component: 'Select',
                                                            className: 'inv-ztgl-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.entity.debiter}}',
                                                            onChange: "{{function (e) {$sf('data.entity.debiter', e)}}}",
                                                            children:'{{$getDzUser(data.user)}}'
                                                        }]
                                                    },{
                                                        name:'zhangtao-jzzt',
                                                        component: '::div',
                                                        className: 'inv-ztgl-custom-popover-item',
                                                        children:[{
                                                            name: 'label',
                                                            component: '::span',
                                                            children: '建账状态：',
                                                            style:{display:'inline-block',width:'80px',textAlign:'right'},
                                                            className: 'inv-ztgl-custom-popover-label'
                                                        },{
                                                            name: 'selectJzzt',
                                                            component: 'Select',
                                                            className: 'inv-ztgl-custom-popover-option',
                                                            getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                            value: '{{data.entity.accountState}}',
                                                            onChange: "{{function (e) {$sf('data.entity.accountState', e)}}}",
                                                            children: {
                                                                name: 'option',
                                                                component: '::Select.Option',
                                                                children: '{{data.Jzzt[_rowIndex].name}}',
                                                                value: '{{data.Jzzt[_rowIndex].value}}',
                                                                _power: 'for in data.Jzzt',
                                                            }
                                                        }]
                                                    },
                                                    // {
                                                    //     name:'zhangtao-kjzz',
                                                    //     component: '::div',
                                                    //     className: 'inv-ztgl-custom-popover-item',
                                                    //     children:[{
                                                    //         name: 'label',
                                                    //         component: '::span',
                                                    //         children: '会计准则：',
                                                    //         style:{display:'inline-block',width:'80px',textAlign:'right'},
                                                    //         className: 'inv-ztgl-custom-popover-label'
                                                    //     },{
                                                    //         name: 'selectKjzz',
                                                    //         component: 'Select',
                                                    //         className: 'inv-ztgl-custom-popover-option',
                                                    //         getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                    //         value: '{{data.entity.accounStandard}}',
                                                    //         onChange: "{{function (e) {$sf('data.entity.accounStandard', e)}}}",
                                                    //         children: {
                                                    //             name: 'option',
                                                    //             component: '::Select.Option',
                                                    //             children: '{{data.accountingStandards[_rowIndex].name}}',
                                                    //             value: '{{data.accountingStandards[_rowIndex].id}}',
                                                    //             _power: 'for in data.accountingStandards',
                                                    //         }
                                                    //     }]
                                                    // }
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
                                        className: 'inv-ztgl-custom-filter-btn header-item',
                                        children: {
                                            name: 'filter',
                                            component: 'Icon',
                                            type: 'filter'
                                        }
                                    }
                                },
                            {//批量导账信息
                                name:'plimport',
                                component:'::div',
                                _visible:'{{data.pl.plVisible}}',
                                className: 'ttk-es-app-ztmanage-content-header-pl',
                                children:[
                                    {
                                        name: 'icon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        type: 'XDZdanchuang-jinggao',
                                        className: 'ttk-es-app-ztmanage-content-header-pl-icon',

                                    },
                                    {
                                        name:'title',
                                        component:'::span',
                                        style:{marginLeft:'8px'},
                                        children:'导账进行中：批量导账'
                                    },
                                    {
                                        name:'title1',
                                        component:'::span',
                                        children:'{{data.pl.importNum}}'
                                    },
                                    {
                                        name:'title2',
                                        component:'::span',
                                        children:'户，已处理'
                                    },
                                    {
                                        name:'title3',
                                        component:'::span',
                                        children:'{{data.pl.detailNum}}'
                                    },
                                    {
                                        name:'title4',
                                        component:'::span',
                                        children:'户'
                                    }
                                ]
                            },
                            {//右侧
                                name: 'header-right',
                                className: 'header-right',
                                component: '::div',
                                style:{
                                    position:'absolute',
                                    right:'10px',
                                    top:'10px',
                                },
                                children: [
                                    {
                                        name: 'pldz',
                                        component: 'Button',
                                        style:{
                                            marginRight:'10px'
                                        },
                                        type: 'primary',
                                        children: '批量导账',
                                        onClick:'{{function(){$handelClick("import")}}}',
                                    },
                                    {//更多操作
                                    	name:'moreOpr',
                                    	component:'Dropdown',
                                    	className:'ant-dropdown-link',
                                    	overlay:{
                                    		name:'menu0',
                                    		component:'Menu',
                                    		children:[
                                            // {
                                            //     name:'menu1',
                                            //     component: 'Menu.Item',
                                            //     children: '批量删除',
                                            //     onClick:'{{function(){$handelClick("del") }}}'
                                            // },
                                            {
                                    			name:'menu2',
                                    			component: 'Menu.Item',
                                    			children: '批改账套信息',
                                                onClick:'{{function(){$handelClick("edit") }}}'
                                            },
                                            {
                                    			name:'menu3',
                                    			component: 'Menu.Item',
                                    			children: '批量报表设置',
                                                onClick:'{{function(){$handelClick("reportPlSet")}}}',
                                                _visible: '{{data.isShow}}'
                                            },
                                            {
                                    			name:'menu4',
                                    			component: 'Menu.Item',
                                    			children: '批量打印设置',
                                                onClick:'{{function(){$handelClick("printSet") }}}'
                                    		}]
                                    	},
                                    	children:{
                                    		name:'menu4',
                                    		component: 'Button',
                                    		children: [' 更多 ',{
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
                         ]
                        }
                    ]
                },
                children: [{
                    name: 'dataGrid',
                    component: 'DataGrid',
                    className: 'ttk-es-app-ztmanage-content-content',
                    ellipsis: true,
                    headerHeight: 37,
                    rowHeight: 37,
                    rememberScrollTop:true,
                    loading: '{{data.other.loading}}',
                    rowsCount: '{{$getListRowsCount()}}',
                    columns: [
                        {
                            name: 'select',
                            component: 'DataGrid.Column',
                            columnKey: 'operation',
                            width: 34,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: [{
                                    name: 'chexkbox',
                                    component: 'Checkbox',
                                    disabled:'{{$getDisabled(data.list)}}',
                                    checked: '{{$isSelectAll("dataGrid")}}',
                                    onChange: '{{$selectAll("dataGrid")}}'
                                }]
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                _power: '({rowIndex})=>rowIndex',
                                children: [{
                                    name: 'select',
                                    component: 'Checkbox',
                                    disabled:'{{data.list[_rowIndex].debitState=="001"&&data.list[_rowIndex].czlx=="1"}}',
                                    checked: '{{data.list[_rowIndex].selected}}',
                                    onChange: '{{$selectRow(_rowIndex)}}'
                                }]
                            }
                        },
                        {
                            name: 'name',
                            component: 'DataGrid.Column',
                            columnKey: 'name',
                            flexGrow: 1,
                            width: 200,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '客户名称'
                            },
                            cell: {
                                name: 'cell',
                                // tip: true,
                                component: 'DataGrid.Cell',
                                className: 'mk-datagrid-cellContent-left',
                                style:{position:'relative'},
                                children:[
                                    {
                                        name:'khmc',
                                        component:'::span',
                                        className:'{{$plDebiState(data.list[_rowIndex])}}',
                                        children: '{{data.list[_rowIndex].name}}'
                                    },
                                    {
                                        name: 'popover',
                                        component: 'Popover',
                                        _visible:'{{data.list[_rowIndex].debitState == "000" && (data.list[_rowIndex].srcid != 0 && data.list[_rowIndex].srcid !="")}}',
                                        content: '有待升级的旧版账套',
                                        placement: 'right',
                                        overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                        children: {
                                            name: 'icon',
                                            component: '::span',
                                            className:'old-title',
                                            children:'旧'

                                        }
                                    },
                                    // {
                                    //     name: 'popover',
                                    //     component: 'Popover',
                                    //     _visible:'{{data.list[_rowIndex].isNotpl ? true : false}}',
                                    //     content: '已存在数据，不支持批量导账！',
                                    //     placement: 'right',
                                    //     overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                    //     children: {
                                    //         name: 'icon',
                                    //         component: 'Icon',
                                    //         fontFamily: 'edficon',
                                    //         type: "XDZdanchuang-jinggao",
                                    //         className: "fail",

                                    //     }
                                    // }
                                ],
                                _power: '({rowIndex})=>rowIndex',
                            }
                        },
                        {
                            name: 'zjm',
                            component: 'DataGrid.Column',
                            columnKey: 'zjm',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '助记码'
                            },
                            cell: {
                                name: 'cell',
                                tip: true,
                                component: 'DataGrid.Cell',
                                // className: 'mk-datagrid-cellContent-left',
                                style:{textAlign:'left'},
                                className:'{{$plDebiState(data.list[_rowIndex])}}',
                                value: '{{data.list[_rowIndex].zjm}}',
                                _power: '({rowIndex})=>rowIndex',
                                // onClick:'{{$openSuccess}}'
                            }
                        },
                        {
                            name: 'accountingStandards',
                            component: 'DataGrid.Column',
                            columnKey: 'accountingStandards',
                            flexGrow: 1,
                            width: 150,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '会计准则'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                className: 'mk-datagrid-cellContent-left',
                                children:'{{$renderCell(data.list[_rowIndex].accountingStandards)}}',
                                // value: "{{data.list[_rowIndex].accountingStandards}}",
                                _power: '({rowIndex})=>rowIndex'
                            }
                        },
                        {
                            name: 'debitState',
                            component: 'DataGrid.Column',
                            columnKey: 'debitState',
                            flexGrow: 1,
                            width: 100,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '导账状态'
                            },
                            cell: {
                                name: 'cell',
                                // tip: true,
                                component: 'DataGrid.Cell',
                                // className: 'mk-datagrid-cellContent-center',
                                className:'{{$plDebiState(data.list[_rowIndex])}}',
                                children: [
                                    {
                                        name:'ss1',
                                        component:'::span',
                                        children:'{{$getDzState(data.list[_rowIndex].debitState,data.list[_rowIndex].czlx)}}'
                                    },
                                    {
                                        name: 'popover',
                                        component: 'Popover',
                                        _visible:'{{((data.list[_rowIndex].debitState == "002"&&data.list[_rowIndex].message != "") || (data.list[_rowIndex].debitState == "003"&&data.list[_rowIndex].message != ""))?true:false }}',
                                        content: '{{$popoverCon(data.list[_rowIndex])}}',
                                        placement: 'right',
                                        overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                                        children: {
                                            name: 'icon',
                                            component: 'Icon',
                                            fontFamily: 'edficon',
                                            type: '{{data.list[_rowIndex].debitState == "002"?"XDZdanchuang-queren":"XDZdanchuang-jinggao"}}',
                                            className: '{{data.list[_rowIndex].debitState == "002"?"success":"fail"}}',

                                        }
                                    },
                                ],
                                _power: '({rowIndex})=>rowIndex'
                            }
                        },
                        {
                            name: 'debitDate',
                            component: 'DataGrid.Column',
                            columnKey: 'debitDate',
                            flexGrow: 1,
                            width: 80,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '导账时间'
                            },
                            cell: {
                                name: 'cell',
                                tip: true,
                                component: 'DataGrid.Cell',
                                // className: 'mk-datagrid-cellContent-center',
                                className:'{{$plDebiState(data.list[_rowIndex])}}',
                                //value: "{{data.list[_rowIndex].debitDate}}",
                                value: "{{data.list[_rowIndex].debitState!='000'?data.list[_rowIndex].debitDate:''}}",
                                _power: '({rowIndex})=>rowIndex'
                            }
                        },
                        {
                            name: 'debitPersonName',
                            component: 'DataGrid.Column',
                            columnKey: 'debitPersonName',
                            flexGrow: 1,
                            width: 80,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '导账人员'
                            },
                            cell: {
                                name: 'cell',
                                tip: true,
                                component: 'DataGrid.Cell',
                                // className: 'mk-datagrid-cellContent-center',
                                className:'{{$plDebiState(data.list[_rowIndex])}}',
                                value: "{{data.list[_rowIndex].debitState!='000'?data.list[_rowIndex].debitPersonName:''}}",
                                _power: '({rowIndex})=>rowIndex'
                            }
                        },
                        {
                            name: 'operation',
                            component: 'DataGrid.Column',
                            columnKey: 'operation',
                            flexGrow: 1,
                            width: 260,
                            header: {
                                name: 'header',
                                component: 'DataGrid.Cell',
                                children: '操作'
                            },
                            cell: {
                                name: 'cell',
                                component: 'DataGrid.Cell',
                                style: { display: 'flex' },
                                _power: '({rowIndex})=>rowIndex',
                                children: [
                                    {
                                        name: 'cjzt',
                                        component: '::span',
                                        children:'建账',
                                        title: '建账',
                                        className: '{{$isZtlj(data.list[_rowIndex],"1")}}',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'1');}}",//按钮是否显示
                                        onClick: '{{$createZt(data.list[_rowIndex])}}'
                                    },
                                    {
                                        name: 'splitLine00',
                                        component: '::span',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'1')}}",//按钮是否显示
                                        title: ''
                                    },
                                    {
                                        name: 'ztxx',
                                        component: '::span',
                                        children:'账套信息',
                                        title: '账套信息',
                                        className: '{{$isZtlj(data.list[_rowIndex],"2")}}',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                        onClick: '{{$ztInfo(data.list[_rowIndex])}}'
                                    },
                                    {
                                        name: 'splitLine10',
                                        component: '::span',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                        title: ''
                                    },                            
                                    {
                                        name: 'bbsz',
                                        component: '::span',
                                        children:[{
                                            name: 'bbsztext',
                                            component: '::span',
                                            children: '报表设置',
                                            className: '{{$isZtlj(data.list[_rowIndex],"2")}}',
                                            onClick: '{{$reportSet(data.list[_rowIndex])}}',
                                            title: '报表设置',
                                        },{
                                            name: 'popover',
                                            component: 'Popover',
                                            content: '需要进行报表设置',
                                            placement: 'top',
                                            overlayClassName: 'ttk-es-app-ztmanage-content-tishi',
                                            children: {
                                                name: 'icon',
                                                component: 'Icon',
                                                fontFamily: 'edficon',
                                                type: "XDZdanchuang-jinggao",
                                                className: "failTig",
    
                                            },
                                            _visible: '{{data.list[_rowIndex].reportFlag}}'
                                        }],
                                        // title: '报表设置',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                    },
                                    {
                                        name: 'splitLine1',
                                        component: '::span',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        _visible:"{{$opreationState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                        title: ''
                                    },{
                                        name: 'dz',
                                        component: '::span',
                                        children:'导账',
                                        title: '导账',
                                        className: '{{$isZtlj(data.list[_rowIndex],"1")}}',
                                        _visible:"{{$opreationZtDzState(data.list[_rowIndex],'1')}}",//按钮是否显示
                                        onClick: '{{$importZt(data.list[_rowIndex],0)}}'
                                    },
                                    {
                                        name: 'dzxx',
                                        component: '::span',
                                        children:'导账信息',
                                        title: '导账信息',
                                        className: '{{$isZtlj(data.list[_rowIndex])}}',
                                        _visible:"{{$opreationZtDzState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                        onClick: '{{$viewImportData(data.list[_rowIndex])}}'
                                    },
                                    {
                                        name: 'jxdz',
                                        component: '::span',
                                        children:'继续导账',
                                        title: '继续导账',
                                        className: '{{$isZtlj(data.list[_rowIndex])}}',
                                        _visible:"{{$opreationZtDzState(data.list[_rowIndex],'99')}}",//按钮是否显示
                                        onClick: '{{$importZt(data.list[_rowIndex],1)}}'
                                    },
                                    {
                                        name: 'splitLine5',
                                        component: '::span',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        _visible:"{{$opreationZtDzState(data.list[_rowIndex],'99')}}",//按钮是否显示
                                        title: ''
                                    },
                                    {
                                        name: 'qxdz',
                                        component: '::span',
                                        children:'取消导账',
                                        title: '取消导账',
                                        className: '{{$isZtlj(data.list[_rowIndex])}}',
                                        _visible:"{{$opreationZtDzState(data.list[_rowIndex],'99')}}",//按钮是否显示
                                        onClick: '{{$cancelImportAccount(data.list[_rowIndex])}}'
                                    },
                                    {
                                        name: 'splitLine6',
                                        component: '::span',
                                        style: {
                                            margin: '0px 4px'
                                        },
                                        children:' | ',
                                        title: ''
                                    },
                                    {
                                        name: 'moreBtn',
                                        className: 'more-drop-down',
                                        component: 'Dropdown',
                                        overlay: {
                                          name: 'more-menu',
                                          className: 'more-drop-down-menu',
                                          component: 'Menu',
                                          children: [
                                            {
                                                name:'more-menu-menu1',
                                                component: 'Menu.Item',
                                                children: '删除账套',
                                                title: '删除账套',
                                                disabled: '{{$menuButControl(data.list[_rowIndex],"del")}}',
                                                _visible:"{{$opreationState(data.list[_rowIndex],'2')}}",//按钮是否显示
                                                onClick:'{{function(){$judgeIsChoseBill("delZtInfo",data.list[_rowIndex])}}}'
                                            },
                                            {
                                                name:'more-menu-menu2',
                                                component: 'Menu.Item',
                                                children: '账套备份',
                                                title: '账套备份',
                                                disabled: '{{$menuButControl(data.list[_rowIndex],"backup")}}',
                                                onClick:'{{function(){$judgeIsChoseBill("backupZtInfo",data.list[_rowIndex])}}}',
                                                _visible:"{{$backupZtState(data.list[_rowIndex])}}"
                                            },
                                            {
                                                name:'more-menu-menu3',
                                                component: 'Menu.Item',
                                                disabled: "{{$getRegainCon(data.list[_rowIndex].accountState,'2',data.list[_rowIndex].debitState)}}",
                                                children: [{
                                                    name:'more-menu-menu4-upload',
                                                    component: 'Upload',
                                                    accept:'.zip',
                                                    action: '{{"/v1/edf/file/upload?token=" + $getAccessToken()}}',
                                                    onChange: '{{function(e){$uploadChange(e,data.list[_rowIndex])}}}',
                                                    beforeUpload: '{{$beforeUpload}}',
                                                    disabled:"{{$getRegainCon(data.list[_rowIndex].accountState,'2',data.list[_rowIndex].debitState)}}",
                                                    showUploadList:false,
                                                    data: '{{$getUploadData(data.list[_rowIndex])}}',
                                                    children:"{{$getRegainCon(data.list[_rowIndex].accountState,'1',data.list[_rowIndex].debitState)}}",
                                                }],
                                                title: '账套恢复',
                                            },
                                            {
                                                name:'more-menu-menu4',
                                                component: 'Menu.Item',
                                                children: '恢复账套查询',
                                                title: '恢复账套查询',
                                                onClick:'{{function(){$judgeIsChoseBill("regainZtQuery",data.list[_rowIndex])}}}'
                                            },
                                          ],
                                          subMenuCloseDelay: 1
                                        },
                                        children: {
                                          name: 'drop-down-btn',
                                          className: 'drop-down-btn',
                                          component: 'Button',
                                          children: [
                                            '更多',
                                            {
                                              name: 'arrow',
                                              className: 'drop-down-icon',
                                              component: 'Icon',
                                              type: 'down'
                                            }
                                          ]
                                        }
                                    }
                                ]
                            }
                        }]
                }, {
                    name: 'footer',
                    component: '::div',
                    className: 'ttk-es-app-ztmanage-content-footer',
                    children: [{
                        name: 'pagination',
                        component: 'Pagination',
                        pageSizeOptions: ['50', '100', '200', '300'],
                        showSizeChanger: true,
                        pageSize: '{{data.pagination.pageSize}}',
                        current: '{{data.pagination.current}}',
                        total: '{{data.pagination.total}}',
                        onChange: '{{$pageChanged}}',
                        showTotal: '{{$pageTotal}}',
                        onShowSizeChange: '{{$pageChanged}}'
                    }]
                }]
            }]
    };
}

export function getInitState() {
    return {
        data: {
            list: [],
            entity:{
                bs: "all",
                fuzzyCondition:"",
                debitState: '',
                debiter: '',
                debitStartDate:'',
                debitEndDate:'',
                accountState:'',
                accounStandard:''
            },
            departId:'',
            departCode:'',
            isDelDept: true,
            pagination: {
                current: 1,
                total: 0,
                pageSize: 50
            },
            filter: {},
            other: {
                permission: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
                },
                loading:''
            },
            status: {
                isDeptCreater: ''
            },
            maxde:'',
            showbm:'分配给我的客户',
            ifgs:'',
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
            filterForm: {//隐藏的筛选条件
                seachtext:'',
                debitState: '',
                debiter: '',
                debitStartDate:'',
                debitEndDate:'',
                accountState:'',
                accounStandard:''
            },
            filterFormOld: {
                seachtext:'',
                debitState: '',
                debiter: '',
                debitStartDate:'',
                debitEndDate:'',
                accountState:'',
                accounStandard:''
            },
            showPopoverCard: false,
            expandedKeys: [],
            treeSelectedKey: [],
            dzResult:[
                {
                    name:'全部',
                    value:''
                },
                {
                    name:'未导账',
                    value:'000'
                },
                {
                    name:'导账中',
                    value:'001'
                },
                {
                    name:'已导账',
                    value:'002'
                },
                {
                    name:'导账失败',
                    value:'003'
                }
            ],
            Jzzt:[
                {
                    name:'全部',
                    value:''
                },
                {
                    name:'未建账',
                    value:'000'
                },
                {
                    name:'已建账',
                    value:'001'
                }
            ],
            user:[],
            chckBoxValue:[],
            ztxx:[],
            pl:{
                importNum:0,
                detailNum:0,
                batchFinished:true,
                plVisible:false
            },
            accountingStandards: [],
            isImportZt:false,
            isShow: false
        }

    };
}
