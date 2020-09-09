import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-detailedHabit-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:[{
				name: 'habitArr',
			    component: '::div',
				className: 'habit',
				_visible: '{{data.other.isTab}}',
                children:[{
					name: 'test1',
					component: '::div',
					className: 'ttk-scm-detailedHabit-card-test1',
					children: {
						name: 'title',
						component: '::div',
						children: '生成业务凭证规则'
					}
				}, {
					name: 'popover',
					component: 'Popover',
					content: '生成业务凭证规则，包含采购入库，暂估入库，盘盈入库，暂估回冲生成凭证业务',
					placement: 'rightTop',
					className: 'helpPopover1',
					children: {
						name: 'icon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'bangzhutishi',
						className: 'helpIcon'
					}
				},{
					name: 'st_scywpzgz',
					component: 'Form.Item',
					className: 'formitem1',
					children: [{
						name: 'check',
						component: 'Radio.Group',
						options: '{{data.other.businessVoucher}}',
						value: '{{data.form.mergeRule1}}',
						onChange: '{{function(e){$checkBoxChange("data.form.mergeRule1", e.target.value)}}}'
					}]
				},{
					name: 'test2',
					component: '::div',
					className: 'ttk-scm-detailedHabit-card-test2',
					children: {
						name: 'title',
						component: '::div',
						children: '生成结转凭证规则'
					}
				},{
					name: 'popover1',
					component: 'Popover',
					content: '生成结转凭证规则，包含销售出库，盘亏出库，产成品入库，材料出库，成本调整生成凭证业务',
					placement: 'rightTop',
					className: 'helpPopover2',
					children: {
						name: 'icon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'bangzhutishi',
						className: 'helpIcon'
					}
				}, {
					name: 'st_scjzpzgz',
					component: 'Form.Item',
					className: 'formitem2',
					children: [{
						name: 'check',
						component: 'Radio.Group',
						options: '{{data.other.carryVoucher}}',
						value: '{{data.form.mergeRule2}}',
						onChange: '{{function(e){$checkBoxChange("data.form.mergeRule2", e.target.value)}}}'
					}]
				}]
			}]
        }
    }
}

export function getInitState() {
	return {
		data: {
			flag: true,
			form: {
				mergeRule1:4000120014,
				mergeRule1:4000120014,
			},
			other: {
				businessVoucher:[{
                    value: 4000120014,
                    label: '按单张生成凭证'
                },{
                    value: 4000120015,
                    label: '同业务类型合并生成凭证'
				}],
				carryVoucher:[{
                    value: 4000120014,
                    label: '按单张生成凭证'
                },{
                    value: 4000120015,
                    label: '同业务类型合并生成凭证'
                }],
			},
			
		}
	}
}
