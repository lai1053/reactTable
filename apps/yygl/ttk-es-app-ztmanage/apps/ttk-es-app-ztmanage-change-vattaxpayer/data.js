import {consts} from 'edf-consts'

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-ztmanage-change-vattaxpayer',
        style: {background: '#fff'},
        children: [
            {
                name:'title',
                component:'::div',
                className: 'ttk-es-app-ztmanage-change-vattaxpayer-title',
                children:'纳税人身份变更为：'
            },


            {
                name:'vatTaxpayerGroup',
                component:'Radio.Group',
                value:'{{data.nsrsf}}',
                onChange:'{{function(e){$changeValue(e)}}}',
                children:[
                    {//一般纳税人
                        name:'ybnsr',
                        component:'::div',
                        className: 'ttk-es-app-ztmanage-change-vattaxpayer-ybnsr',
                        children:[
                            {
                                name:'ybnsrRadio',
                                component:'Radio',
                                disabled:'{{data.nsrsf1 != 2000010001 }}',
                                children:'一般纳税人',
                                value:2000010001
                            },
                            {
                                name:'ybnsrDiv',
                                component:'::div',
                                _visible:'{{data.nsrsf1 == 2000010001 && data.xgmV == 0}}',
                                children:[
                                    {
                                        name:'ybnsrTime',
                                        component: 'Form.Item',
                                        label: '有效期起：',
                                        children:[
                                            {
                                                name:'ybnsrDate',
                                                component: 'DatePicker.MonthPicker',
                                                disabledDate:'{{$disabledDate}}',
                                                disabled:'{{data.isEnablee || data.ss}}',
                                                value: "{{$stringToMoment((data.ybnsrDate),'YYYY-MM-DD')}}",
                                                onChange:'{{function(e){$ybnsrDateChange(e)}}}'
                                            },
                                            {
                                                name:'spanTime',
                                                component:'::span',
                                                className: '{{(data.isEnablee || data.ss)?"ttk-es-app-ztmanage-change-vattaxpayer-timenone":"ttk-es-app-ztmanage-change-vattaxpayer-timefff"}}',
                                                children:'{{data.ybnsrDate}}'
                                            }
                                        ]
                                    },
                                    {
                                        name:'checkBox',
                                        component:'Checkbox',
                                        className: 'ttk-es-app-ztmanage-change-vattaxpayer-ybnsr-checkbox',
                                        checked: '{{data.isEnable}}',
                                        children:'辅导期',
                                        onClick:'{{$checkboxChange}}'
                                    },
                                    {
                                        name:'fdq',
                                        component: 'Form.Item',
                                        style:{marginTop:'0'},
                                        // _visible:'{{data.isEnable}}',
                                        label: '辅导期有效期：',
                                        children:[
                                            {
                                                name:'fdqStartDate',
                                                component: 'DatePicker.MonthPicker',
                                                disabled:'{{(!data.isEnablee || data.fdq == 1)}}',
                                                value: "{{$stringToMoment((data.fdqStartDate),'YYYY-MM-DD')}}",
                                                disabledDate:'{{$disabledDateFDQStart}}',
                                                onChange:'{{function(e){$fdqStartChange(e)}}}',
                                                placeholder:'开始日期'
                                            },
                                            {
                                                name:'spanTime',
                                                component:'::span',
                                                className: '{{(!data.isEnablee || data.fdq == 1)?"ttk-es-app-ztmanage-change-vattaxpayer-timestartn":"ttk-es-app-ztmanage-change-vattaxpayer-timestart"}}',
                                                children:'{{data.fdqStartDate}}'
                                            },
                                            {
                                                namg:'fdqCenter',
                                                component:'::span',
                                                children:'-'
                                            },
                                            {
                                                name:'fdqEndDate',
                                                component: 'DatePicker.MonthPicker',
                                                disabled:'{{!data.isEnablee}}',
                                                value: "{{$stringToMoment((data.fdqEndDate),'YYYY-MM-DD')}}",
                                                disabledDate:'{{$disabledDateFDQEnd}}',
                                                onChange:'{{function(e){$fdqEndChange(e)}}}',
                                                placeholder:'结束日期'
                                            },
                                            {
                                                name:'spanTime',
                                                component:'::span',
                                                className: '{{(!data.isEnablee )?"ttk-es-app-ztmanage-change-vattaxpayer-timeendn":"ttk-es-app-ztmanage-change-vattaxpayer-timeend"}}',
                                                children:'{{data.fdqEndDate}}'
                                            }
                                        ]
                                    },
                                    {
                                        name:'clear',
                                        component:'::div',
                                        style:{clear:'both'}
                                    }
                                ]
                            }
                        ]
                    },
                    {//小规模纳税人
                        name:'xgmnsr',
                        component:'::div',
                        children:[
                            {
                                name:'xgmRadio',
                                component:'Radio',
                                disabled:'{{data.nsrsf1 != 2000010002 && data.fdq == 0}}',
                                children:'小规模纳税人',
                                value:2000010002
                            },
                            {
                                name:'xgmTime',
                                component: 'Form.Item',
                                _visible:'{{data.nsrsf1 == 2000010002 || data.xgmV == 1}}',
                                label: '有效期起：',
                                children:[
                                    {
                                        name:'xgmDate',
                                        component: 'DatePicker.MonthPicker',
                                        disabled:'{{data.fdq==1}}',
                                        disabledDate:'{{$disabledDate}}',
                                        value: "{{$stringToMoment((data.xgmDate),'YYYY-MM-DD')}}",
                                        onChange:'{{function(e){$xgmDateChange(e)}}}'
                                    },
                                    {
                                        name:'spanTime',
                                        component:'::span',
                                        className: '{{data.fdq==1?"ttk-es-app-ztmanage-change-vattaxpayer-timenone":"ttk-es-app-ztmanage-change-vattaxpayer-timefff"}}',
                                        children:'{{data.xgmDate}}'
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
        ]
        
    }
}

export function getInitState() {
    return {
        data: {
            // vatTaxpayer:0
            xgmDate:'',//小规模有效期起
            ybnsrDate:'',//一般纳税人有效期起
            isEnable:false,
            isEnablee:false,
            fdqStartDate:'',
            fdqEndDate:'',
            fdq:0,
            enabledDate:'',
            xgmV:0,
            ss:false

        }
    }
}