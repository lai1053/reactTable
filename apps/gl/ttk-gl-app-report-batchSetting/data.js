export function getMeta() {
    return {
        name: 'root',
        component: '::div',
        className: 'ttk-gl-app-report-batchSetting-root fromJRB',
        children: [
            {
                name:'title',
                component:'::div',
                _visible:'{{data.other.showValueType?true:false}}',
                style:{
                    width:'95px',
                    height:'35px',
                    background:'#0066B3',
                    borderRadius: '0px',
                    color:'#fff',
                    fontSize: '16px',
                    padding:'5px 15px'
                },
                className: 'ttk-gl-app-report-setting-root-step',
                children:'规则设置',
            },
          {
            name: 'content2',
            component: 'Form',
            // className: 'ttk-gl-app-report-batchSetting-root-content2',
            className:'{{data.other.showValueType ? "ttk-gl-app-report-batchSetting-root-content2" : "ttk-gl-app-report-batchSetting-root-content22"}}',
            children:[{
                name: 'row1',
                component: 'Form.Item',
                label:[
                    {
                        name:'settingPopover',
                        component: 'Popover',
                        content:[
                            {
                                name: 'span1',
                                component: '::div',
                                style: {width: '415px'},
                                children:'1、不重分类，不对任何往来科目重分类。'
                            },
                            {
                                name: 'span2',
                                component: '::div',
                                style: {width: '415px'},
                                children:'2、重分类，对6个往来科目（应收账款、预付账款、其他应收款、应付账款、预收账款、其他应付款），进行重分类。'
                            },
                            {
                                name: 'span3',
                                component: '::div',
                                style: {width: '415px'},
                                children:'3、部分重分类，对4往来科目（应收账款、预付账款、应付账款、预收账款），进行重分类。'
                            },
                        ],
                        placement: "bottomLeft",
                        children: {
                            name: 'settingBtn',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'reload',
                        }
                    },{
                        name:'title',
                        component: '::span',
                        children:'报表重分类设置',
                    }
                ],
                colon: false,
                children:[{
                    name: 'radiog',
                    component: 'Radio.Group',
                    value: '{{data.other.reClassType}}',
                    onChange: '{{function(e) {return $handleMath(e, "reClassType")}}}',
                    children:[{
                        name: 'radio3',
                        component: 'Radio',
                        value: 'false',
                        children: '不重分类'
                    },{
                        name: 'radio1',
                        component: 'Radio',
                        value: 'true',
                        children: '重分类'
                    },{
                        name: 'radio2',
                        component: 'Radio',
                        value: 'part',
                        children: '部分重分类'
                    }]
                }]
            },{
                name: 'row2',
                component: 'Form.Item',
                label: '报表公式设置',
                colon: false,
                children: [{
                    name: 'adom',
                    component: '::a',
                    children: '报表公式',
                    onClick: '{{$handleReportFormula}}'
                }]
            },{
                name: 'row3',
                component: 'Form.Item',
                label: '利润表【本月金额】取数',
                colon: false,
                _visible: '{{data.other.showValueType}}',
                children: [{
                    name: 'radiogroup',
                    component: 'Radio.Group',
                    value: '{{data.other.valueType}}',
                    onChange: '{{function(e) {return $handleMath(e, "valueType")}}}',
                    children:[{
                        name: 'radio1',
                        component: 'Radio',
                        value: 4,
                        children: '取季度最后月份数据'
                    },{
                        name: 'radio2',
                        component: 'Radio',
                        value: 3,
                        children: '取季度全部数据'
                    }]
                }]
            },{
                name: 'row4',
                component: '::div',
                colon: false,
                _visible: '{{data.other.showValueType}}',
                children: [{
                    name: 'row6',
                    component: '::div',
                    style:{
                        color: 'rgb(235, 148, 89)',
                        left: '0px',
                        width: '156px',
                        position: 'relative',
                        float: 'left',
                        fontSize:'14px',
                        textAlign: 'right'
                    },
                    children:'温馨提示:',
                },{
                    name: 'row5',
                    style:{
                        width: '100%',
                        wordWrap: 'break-word',
                        textAlign: 'left',
                        display: 'block',
                        fontSize:'14px',
                        paddingLeft: '164px'
                    },
                    component: '::div',
                    children:'【本月金额】取数，仅影响季报的财务报表(小企业会计准则、会计制度)，利润表，本月金额列取数区间',
                }]
            },{
                name: 'xinajin1',
                component: 'Form.Item',
                label: '现金流量设置',
                _visible: '{{!data.other.unShieldCashFlowStatement}}',
                colon: false,
                children: [{
                    name: 'radiogroup',
                    component: 'Radio.Group',
                    value: '{{data.other.needCashFlowStatement}}',
                    disabled:'{{data.other.dataSource=="accountBalance"?true:false}}',
                    onChange: '{{function(e) {return $handleMathXianjin(e, "needCashFlowStatement")}}}',
                    children:[{
                        name: 'radio1',
                        component: 'Radio',
                        value: 'true',
                        children:[
                            {
                                name:'name',
                                component:'::span',
                                children:'生成'
                            },{
                                name:'name1',
                                component:'::span',
                                style:{
                                    color: 'red',
                                },
                                children:'（限于使用金财代账财务模块的客户）'
                            }
                        ]
                    },{
                        name: 'radio2',
                        component: 'Radio',
                        value: 'false',
                        children: '不生成'
                    }]
                }]
            }]
        },{
            name: 'footer',
            component: '::div',
            className: 'ttk-gl-app-report-batchSetting-root-footer',
            children:[{
                name: 'save',
                component: 'Button',
                // type: 'primary',
                className: 'primaryBtn',
                onClick: '{{$handleSave}}',
                children: '保存'
            },{
				name: 'cancel',
				component: 'Button',
                style: {marginLeft: '10px'},
				onClick: '{{$handleCancel}}',
				children: '取消'
			}]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            other: {
                loading: true,
                tableList: [],
                noMapTableList: [],
                accountList:[],
                tab1: true,
                tab2: false,
                dataSource:'accountBalance',
                needCashFlowStatement:'false',
                match: '1',
                reClassType: 'true',
                unShieldCashFlowStatement:false,
                valueType: 4,
                showValueType: false, //是否显示“利润表【本月金额】取数”
                // noMappingCount: 0, //未匹配科目数
                // origAccountCount: 0, //全部科目数
                // yesMappingCount: 0, //未匹配科目数
                aboutAccount: {
                    noMappingCount: 0, //未匹配科目数
                    origAccountCount: 0, //全部科目数
                    yesMappingCount: 0, //未匹配科目数
                },
                isCanNext: true,
                orgIds: []
            },
            tableOption: {}
        }
    }
}