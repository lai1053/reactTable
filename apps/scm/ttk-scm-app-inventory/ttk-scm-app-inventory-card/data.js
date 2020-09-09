import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-inventory-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:{
                name: 'form',
                component: 'Form',
				className: 'ttk-scm-app-inventory-card-form',
                children:[{
                    name:'date',
                    component: 'Form.Item',
                    className:'date',
                    label: '启用月份',
                    children: [{
                        name: 'date',
                        component: 'DatePicker.MonthPicker',
                        value: '{{$stringToMoment(data.other.beginDate)}}',
                        onChange: "{{function(d){$changeDate($momentToString(d,'YYYY-MM'))}}}",
                        disabledDate: '{{function(value){return $disabledBeginDate(value)}}}'
                    }]
                },
                {
                    name: 'closeInventoryBtn',
                    classname: 'closeInventoryBtn',
                    component: 'Button',
                    style: {
                        position: 'absolute',
                        left: '263px',
                        top: '11px'
                    },
                    disabled:true,
                    children: '关闭存货'
                },
                {
                    name:'method',
                    component: 'Form.Item',
                    className: '{{ data.form.valuationMethodId==1 ? "formitem valuationMethod" : "formitem" }}',
                    label: '计价核算方式',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.valuationMethod}}',
                        value: '{{data.form.valuationMethodId}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.valuationMethodId", e.target.value, "valuationMethod")}}}'
                    }]
                }, {
                    name: 'check',
                    component: 'Radio.Group',
                    options: '{{data.other.method}}',
                    className: 'method-group-item',
                    _visible: '{{data.form.valuationMethodId == 1}}',
                    value: '{{data.form.methodId}}',
                    onChange: '{{function(e){$checkBoxChange("data.form.methodId", e.target.value)}}}'
                }, {
                    name: 'inputNumber1',
                    component: '::div',
                    className: 'number',
                    _visible: '{{data.form.valuationMethodId == 2}}',
                    children: [{
                        name:'star',
                        component: '::div',
                        children: '*',
                    },{
                        name: "input",
                        component: 'Input.Number',
                        value: '{{ Number(data.form.inputNumber) && (data.form.inputNumber).toFixed(2) || ""}}',
                        precision: 2,
                        className: '{{ data.accountRatioError ? "error" : "" }}',
                        //onChange: '{{function(e){$checkBoxChange("data.form.inputNumber", e)}}}'
                        onBlur: '{{function(e){$accountRatioBlur("data.form.inputNumber", e)}}}',
                    }, " %"]
                }, {
                    name: 'inputNumber3',
                    component: '::div',
                    className: 'number number-pro',
                    _visible: '{{data.form.valuationMethodId == "3"}}',
                    children: [{
                        name:'star',
                        component: '::div',
                        children: '*',
                    },{
                        name: "input",
                        component: 'Input.Number',
                        value: '{{ Number(data.form.inputNumber) && (data.form.inputNumber).toFixed(2) || ""}}',
                        precision: 2,
                        className: '{{ data.accountRatioError ? "error" : "" }}',
                        //onChange: '{{function(e){$selectMethod("data.form.inputNumber", e)}}}',
                        onBlur: '{{function(e){$accountRatioBlur("data.form.inputNumber", e)}}}',
                    }, " %"]
                }, {
                    name:'production',
                    component: 'Form.Item',
                    className: '{{ data.form.productionId == 2 ? "formitem production production-bom" : "formitem production" }}',
                    label: '生产核算方式',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.production}}',
                        value: '{{data.form.productionId}}',
                        //disabled: '{{!data.form.isChange}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.productionId", e.target.value)}}}'
                    }]
                }, {
                    name: 'inputNumber2',
                    component: '::div',
                    className: 'number number-production',
                    children: [{
                        name:'star',
                        component: '::div',
                        children: '*',
                        _visible: '{{data.form.productionId == 3}}'
                    },{
                        name: "input",
                        component: 'Input.Number',
                        _visible: '{{data.form.productionId == 3}}',
                        value: '{{ Number(data.form.inputNumber) && (data.form.inputNumber).toFixed(2) || ""}}',
                        precision: 2,
                        className: '{{ data.accountRatioError ? "error" : "" }}',
                        //onChange: '{{function(e){$checkBoxChange("data.form.inputNumber", e)}}}'
                        onBlur: '{{function(e){$accountRatioBlur("data.form.inputNumber", e)}}}',
                    }, {
                        name: 'words',
                        component: '::span',
                        _visible: '{{data.form.productionId == 3}}',
                        // className: 'production-words',
                        children: ' % '
                    }/*, {
                        name: 'helpPopover',
                        component: 'Popover',
                        content: '计价核算方式为"按成本占收入比例核算"时才会勾选',
                        placement: 'rightTop',
                        overlayClassName: 'ttk-scm-app-inventory-card-helpPopover',
                        children: {
                            name: 'helpIcon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            type: 'bangzhutishi',
                            className: 'helpIcon'
                        }
                    }*/]
                },{
                    name:'cost',
                    component: 'Form.Item',
                    label: '原料成本取值',
                    _visible: '{{data.form.productionId == 2}}',
                    className: 'formitem formitem-cost',
                    children:[{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.cost}}',
                        value: '{{data.form.costId}}',
                        onChange: '{{function(e){$checkBoxChange("data.form.costId", e.target.value)}}}'
                    }]
                }, 
                {
                    name: 'recoilMode',
                    component: 'Form.Item',
                    className: 'formitem recoilMode recoilMode-bom',
                    label: '回冲方式',
                    children: [{
                        name: 'check',
                        component: 'Radio.Group',
                        options: '{{data.other.recoilMode}}',
                        value: '{{data.form.recoilModeId}}',
                        //disabled: '{{!data.form.isChange}}',
                        onChange: '{{function(e){$selectMethod("data.form.recoilModeId", e.target.value, "recoilMode")}}}'
                    }]
                }
            ]
            }
        }
    }
}

export function getInitState() {
	return {
		data: {
			other: {
				loading: false,
                beginDate: moment().format('YYYY-MM'),
                valuationMethod: [{
                    value: 1,
                    label: '按商品明细核算'
                },{
                    value: 2,
                    label: '按成本占收入比例核算(金额不变)'
                },{
                    value: 3,
                    label: '按成本占收入比例核算(单价不变)'
                }],
                method:[{
                    value: 2,
                    label: '全月平均法'
                },{
                    value: 1,
                    label: '移动平均法'
                }],
                recoilMode: [{
                    value: '0',
                    label: '月初回冲'
                }, {
                    value: '1',
                    label: '单到回冲'
                }],
                production:[{
                    value: 1,
                    label: '传统生产'
                },{
                    value: 3,
                    disabled: 'disabled',
                    label: '以销定产 按成本占收入比例核算'
                },{
                    value: 2,
                    label: '以销定产 按销售数量和配置原料（BOM）核算'
                }],
                cost:[{
                    value: 1,
                    label: '按计价核算方式取值'
                },{
                    value: 2,
                    label: '按配置原料的单价取值'
                }]
            },
            form:{
                valuationMethodId: 1,
                recoilModeId: '1',
                methodId: 2,
                productionId: 1,
                costId: 1,
                check: '',
                inputNumber: 100
            },
            accountRatioError: false,
		}
	}
}
