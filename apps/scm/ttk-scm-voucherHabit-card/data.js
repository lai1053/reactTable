import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-voucherHabit-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:[{
				name: 'tabNav',
				component: 'Tabs',
				_visible: '{{data.other.isTab}}',
				activeKey: '{{data.form.activeKey}}',
				onChange: '{{function(v){$changeTab(v)}}}',
				children: [{
					name: "option",
					component: 'Tabs.TabPane',
					tab: [{
						name: 'tab',
						component: '::div',
						children: "{{ data.other.activeKey && data.other.activeKey[_rowIndex].name }}",
					}],
					key: "{{ data.other.activeKey && data.other.activeKey[_rowIndex].id }}",
					_power: 'for in data.other.activeKey'
				}]
			},{
                name: 'prompt',
			    component: '::span',
				className: 'prompt',
                children:'提示：您选择的凭证习惯，将会影响到凭证及分录的合并拆分规则'
            },{
				name: 'habit',
			    component: '::div',
				className: 'habit',
				_visible: '{{!data.other.isTab}}',
                children:[{
					name: 'title',
					component: '::div',
					className: 'title',
					children: '{{data.other.title}}'
				},{
					name: 'title',
					component: 'Radio.Group',
					options: '{{data.other.habit}}',
					value: '{{data.form.habitId}}',
					onChange: '{{function(e){$changeRadio(e.target.value)}}}'
				},{
					name: 'settleMerge',
					component: '::div',
					children: '{{$renderCheck()}}',
					_visible: '{{data.flag}}',
				},{
					name: 'ping_habit_title',
					component: '::div',
					children: '凭证习惯：',
					style: {fontSize: 12},
					_visible: '{{!data.flag}}',
				},{
					name: 'jt_ping',
					component: 'Form.Item',
					className: 'xc_form',
					_visible: '{{!data.flag}}',
					label: '计提凭证',
					children: [{
						name: 'jt_habit',
						component: 'Radio.Group',
						className: 'xc_form_radio',
						disabled: '{{data.form.isHeBing && data.form.habitId == 4000120021 }}',
						options: '{{data.other.jtHabit}}',
						value: '{{data.form.jtHabitId}}',
						onChange: '{{function(e){$changeXCRadio(e.target.value, "data.form.jtHabitId")}}}'
					}]
				},{
					name: 'ff_ping',
					component: 'Form.Item',
					className: 'xc_form',
					_visible: '{{!data.flag}}',
					label: '发放凭证',
					children: [{
						name: 'ff_habit',
						component: 'Radio.Group',
						className: 'xc_form_radio',
						disabled: '{{data.form.isHeBing && data.form.habitId == 4000120021}}',
						options: '{{data.other.ffHabit}}',
						value: '{{data.form.ffHabitId}}',
						onChange: '{{function(e){$changeXCRadio(e.target.value, "data.form.ffHabitId")}}}'
					}]
				},{
					name: 'he_ping',
					component: '::div',
					className: 'he_ping',
					children: '{{$renderXCHe()}}',
					_visible: '{{!data.flag && data.form.habitId == 4000120021}}',
				},{
					name: 'date',
					component: 'Form.Item',
					label: '日期习惯',
					className: 'date',
					children: [{
						name: 'select',
						component: 'Select',
						value: '{{data.form.dateHabitId}}',
						onChange: `{{function(v){$fieldChange('data.form.dateHabitId',data.other.dateHabit.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.dateHabit && data.other.dateHabit[_rowIndex].id}}',
							children: '{{data.other.dateHabit && data.other.dateHabit[_rowIndex].name}}',
							_power: 'for in data.other.dateHabit'
						}
					}]
				},{
					name: 'operations',
					component: 'Form.Item',
					className: 'checkboxGroups',					
					label: '摘要习惯',
					children: '{{$renderCheckGroup()}}'
				},{
					name: 'text',
					component: '::div',
					className: 'text',					
					children: '{{$renterText()}}'
				}]
			},{
				name: 'habitArr',
			    component: '::div',
				className: 'habit',
				_visible: '{{data.other.isTab}}',
                children:[{
					name: 'titleArr',
					component: 'Radio.Group',
					options: '{{data.other.habit}}',
					value: '{{data.form.habitId}}',
					onChange: '{{function(e){$changeRadioArr(e.target.value)}}}'
				},{
					name: 'settleMerge',
					component: '::div',
					children: '{{$renderChecks()}}'
				},{
					name: 'date',
					component: 'Form.Item',
					label: '日期习惯',
					className: 'date',
					children: [{
						name: 'select',
						component: 'Select',
						value: '{{data.form.dateHabitId}}',
						onChange: `{{function(v){$fieldChangeArr('data.form.dateHabitId',data.other.dateHabit.filter(function(o){return o.id == v})[0])}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: '{{data.other.dateHabit && data.other.dateHabit[_rowIndex].id}}',
							children: '{{data.other.dateHabit && data.other.dateHabit[_rowIndex].name}}',
							_power: 'for in data.other.dateHabit'
						}
					}]
				},{
					name: 'operations',
					component: 'Form.Item',
					className: 'checkboxGroups',
					label: '摘要习惯',
					children: '{{$renderCheckGroups()}}'
				},{
					name: 'text',
					component: '::div',
					className: 'text',					
					children: '{{$renterTextTab()}}'
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
				checkArr:['开票日期'],
				jtHabitId: false,
				ffHabitId: false
			},
			other: {
				error: {},
				loading: false,
				habit:[],
				dateHabit:[],
				isTab: false,
				tabKey: [{
					id: 1
				},{
					id: 2
				}],
				jtHabit: [{
					value: true,
					label: '合并生成'
				},{
					value: false,
					label: '拆分生成'
				}],
				ffHabit: [{
					value: true,
					label: '合并生成'
				},{
					value: false,
					label: '拆分生成'
				}]
			}
		}
	}
}
